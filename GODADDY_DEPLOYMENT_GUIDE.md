# GoDaddy VPS Deployment Rehberi
## AlmaLinux 9 + cPanel + Node.js + MongoDB

Bu rehber, GoDaddy VPS sunucunuzda Next.js uygulamanızı çalıştırmanız için gereken tüm adımları içerir.

## Önkoşullar
- GoDaddy VPS (AlmaLinux 9 + cPanel)
- SSH erişimi
- Root veya sudo yetkisi
- Domain adınız

## 1. SSH Erişimi ve İlk Kontroller

### 1.1 SSH ile Sunucuya Bağlanın
```bash
ssh root@YOUR_SERVER_IP
# veya
ssh your_username@YOUR_SERVER_IP
```

### 1.2 Sistem Güncellemesi
```bash
sudo dnf update -y
sudo dnf upgrade -y
```

### 1.3 Gerekli Araçları Kontrol Edin
```bash
# Git kontrolü
git --version

# Eğer git yüklü değilse:
sudo dnf install git -y
```

## 2. Node.js Kurulumu

### 2.1 NodeSource Repository Ekleyin
```bash
# Node.js 20.x LTS sürümü için
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js kurulumu
sudo dnf install nodejs -y

# Kurulumu doğrulayın
node --version
npm --version
```

### 2.2 Alternatif: NVM ile Kurulum (Önerilen)
```bash
# NVM kurulumu
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Terminal'i yeniden başlatın veya:
source ~/.bashrc

# Node.js 20 LTS kurulumu
nvm install 20
nvm use 20
nvm alias default 20

# Doğrulama
node --version
npm --version
```

## 3. MongoDB Kurulumu

### 3.1 MongoDB Repository Ekleyin
```bash
# MongoDB repository dosyası oluşturun
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo > /dev/null <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
```

### 3.2 MongoDB Kurulumu
```bash
# MongoDB kurulumu
sudo dnf install mongodb-org -y

# MongoDB servisini başlatın
sudo systemctl start mongod
sudo systemctl enable mongod

# Durumu kontrol edin
sudo systemctl status mongod

# MongoDB'ye bağlanın ve test edin
mongosh
# MongoDB shell'de:
# > show dbs
# > exit
```

### 3.3 MongoDB Güvenlik Ayarları
```bash
# MongoDB güvenlik ayarları
mongosh
```

MongoDB shell'de aşağıdaki komutları çalıştırın:
```javascript
// Admin kullanıcısı oluşturun
use admin
db.createUser({
  user: "admin",
  pwd: "GÜÇLÜ_ŞİFRE_BURAYA",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

// Uygulama için veritabanı ve kullanıcı oluşturun
use hygieia
db.createUser({
  user: "hygieia_user",
  pwd: "UYGULAMA_ŞİFRESİ",
  roles: [{ role: "readWrite", db: "hygieia" }]
})

exit
```

### 3.4 MongoDB Konfigürasyonu
```bash
# MongoDB config dosyasını düzenleyin
sudo nano /etc/mongod.conf
```

Aşağıdaki ayarları ekleyin/değiştirin:
```yaml
# security:
#   authorization: enabled

# Güvenliği etkinleştirmek için yorumu kaldırın:
security:
  authorization: enabled
```

```bash
# MongoDB'yi yeniden başlatın
sudo systemctl restart mongod
```

## 4. PM2 Process Manager Kurulumu

```bash
# PM2'yi global olarak kurun
npm install -g pm2

# PM2'nin sistem başlangıcında otomatik başlaması için
pm2 startup
# Çıkan komutu çalıştırın (sudo ile başlayan komut)
```

## 5. Nginx Kurulumu (Reverse Proxy)

### 5.1 Nginx Kurulumu
```bash
sudo dnf install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.2 Firewall Ayarları
```bash
# Gerekli portları açın
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## 6. Proje Dosyalarını Sunucuya Yükleme

### 6.1 Git Repository Clone
```bash
# Proje klasörü oluşturun
sudo mkdir -p /var/www/hygieia
sudo chown $USER:$USER /var/www/hygieia

# Git clone (önce GitHub'a push edin)
cd /var/www/hygieia
git clone https://github.com/YOUR_USERNAME/hygieia_v4.git .

# Veya dosyaları SCP/SFTP ile yükleyin
```

### 6.2 Bağımlılıkları Kurun
```bash
cd /var/www/hygieia

# Dependencies kurulumu
npm install

# Production build
npm run build
```

## 7. Environment Variables Ayarlama

### 7.1 .env.local Dosyası Oluşturun
```bash
cd /var/www/hygieia
nano .env.local
```

Aşağıdaki içeriği ekleyin:
```bash
# MongoDB
MONGODB_URI=mongodb://hygieia_user:UYGULAMA_ŞİFRESİ@localhost:27017/hygieia?authSource=hygieia

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=GÜÇLÜ_NEXTAUTH_SECRET_BURAYA

# Diğer environment variables
NODE_ENV=production
```

## 8. PM2 ile Uygulamayı Çalıştırma

### 8.1 PM2 Ecosystem Dosyası
`ecosystem.config.js` dosyanız zaten mevcut. Kontrol edin:
```bash
cat ecosystem.config.js
```

### 8.2 Uygulamayı Başlatın
```bash
# PM2 ile uygulamayı başlatın
pm2 start ecosystem.config.js

# Durumu kontrol edin
pm2 status
pm2 logs

# Otomatik başlatma için kaydedin
pm2 save
```

## 9. Nginx Reverse Proxy Konfigürasyonu

### 9.1 Site Konfigürasyonu
```bash
sudo nano /etc/nginx/conf.d/hygieia.conf
```

Aşağıdaki konfigürasyonu ekleyin:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.2 Nginx'i Yeniden Başlatın
```bash
# Konfigürasyon testi
sudo nginx -t

# Nginx'i yeniden başlatın
sudo systemctl restart nginx
```

## 10. SSL Sertifikası (Let's Encrypt)

### 10.1 Certbot Kurulumu
```bash
sudo dnf install certbot python3-certbot-nginx -y
```

### 10.2 SSL Sertifikası Alın
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 10.3 Otomatik Yenileme
```bash
# Crontab'a otomatik yenileme ekleyin
sudo crontab -e

# Aşağıdaki satırı ekleyin:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 11. cPanel Entegrasyonu

### 11.1 Subdomain Yönlendirmesi (Opsiyonel)
cPanel'de:
1. Subdomain oluşturun (örn: app.your-domain.com)
2. DNS yönetiminden A kaydını sunucu IP'sine yönlendirin

### 11.2 Apache ile Uyumluluk
```bash
# Apache'nin port 80'i kullanmaması için
sudo systemctl stop httpd
sudo systemctl disable httpd

# Veya farklı port kullanması için Apache konfigürasyonu
```

## 12. Database Seed (İlk Veri)

```bash
cd /var/www/hygieia

# Seed scriptlerini çalıştırın
node scripts/seed-categories.js
node scripts/seed-products.js
```

## 13. Monitoring ve Log Yönetimi

### 13.1 PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs --lines 100
```

### 13.2 Log Rotation
```bash
# PM2 log rotation
pm2 install pm2-logrotate
```

## 14. Backup Stratejisi

### 14.1 MongoDB Backup Script
```bash
# Backup scripti oluşturun
sudo nano /usr/local/bin/mongodb-backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
mkdir -p $BACKUP_DIR

mongodump --host localhost --port 27017 -u hygieia_user -p UYGULAMA_ŞİFRESİ --authenticationDatabase hygieia --db hygieia --out $BACKUP_DIR/$DATE

# 7 günden eski backupları sil
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

```bash
# Script'i çalıştırılabilir yapın
sudo chmod +x /usr/local/bin/mongodb-backup.sh

# Crontab'a günlük backup ekleyin
sudo crontab -e
# 0 2 * * * /usr/local/bin/mongodb-backup.sh
```

## 15. Troubleshooting

### 15.1 Yaygın Sorunlar
```bash
# Port kontrolü
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :27017

# Service durumları
sudo systemctl status mongod
sudo systemctl status nginx
pm2 status

# Logs kontrolü
pm2 logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/mongod.log
```

### 15.2 Güvenlik Kontrolleri
```bash
# Firewall durumu
sudo firewall-cmd --list-all

# Açık portlar
sudo ss -tlnp
```

## 16. Performans Optimizasyonu

### 16.1 MongoDB Optimizasyonu
```bash
# MongoDB konfigürasyonu
sudo nano /etc/mongod.conf
```

```yaml
# Performans ayarları
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # RAM'in yarısı kadar
```

### 16.2 Nginx Optimizasyonu
```bash
sudo nano /etc/nginx/nginx.conf
```

```nginx
# Performans ayarları
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## 17. Domain ve DNS Ayarları

1. GoDaddy Domain yönetiminden:
   - A Record: @ → Sunucu IP
   - A Record: www → Sunucu IP
   - CNAME Record: app → @ (opsiyonel subdomain için)

2. Propagasyonu kontrol edin:
```bash
nslookup your-domain.com
dig your-domain.com
```

## Notlar

- **Güvenlik**: Tüm şifreleri güçlü yapın
- **Backup**: Düzenli backup almayı unutmayın
- **Monitoring**: PM2 monit ile sürekli kontrol edin
- **Updates**: Düzenli sistem güncellemeleri yapın
- **cPanel**: Mümkünse Node.js uygulaması için ayrı port kullanın

Bu rehberle uygulamanız GoDaddy VPS sunucunuzda çalışmaya hazır olacak! 