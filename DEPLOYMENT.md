# 🚀 Hygieia v4 - Production Deployment Guide (AlmaLinux 9.6.0 + Apache)

## 📋 Önemli Notlar
- ✅ **Build Başarılı**: Uygulama production için hazır
- ⚠️ **ESLint Disabled**: Deployment için ESLint kuralları gevşetildi
- 🗄️ **MongoDB Required**: Production MongoDB veritabanı gerekli
- 🐧 **AlmaLinux 9.6.0**: RHEL tabanlı Enterprise Linux dağıtımı
- 🌐 **Apache + Node.js**: Apache reverse proxy ile Node.js backend

## 🏗️ Production Build (Tamamlandı ✅)

Build işlemi başarıyla tamamlandı:
```bash
npm run build
# ✅ Build successful - 41 routes generated
```

## 🛠️ Sunucu Gereksinimleri

### 1. Sistem Gereksinimleri
- **AlmaLinux**: 9.6.0 veya üzeri
- **Node.js**: 18.0.0 veya üzeri
- **npm**: 8.0.0 veya üzeri  
- **Apache**: 2.4+ (httpd)
- **Memory**: En az 2GB RAM
- **Storage**: En az 5GB disk alanı
- **CPU**: En az 2 core

### 2. Sistem Güncellemesi
```bash
# Sistem paketlerini güncelle
sudo dnf update -y

# EPEL repository ekle
sudo dnf install -y epel-release

# Development tools
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y curl wget git vim
```

### 3. Firewall Ayarları
```bash
# Firewall durumu kontrol
sudo systemctl status firewalld

# HTTP ve HTTPS portlarını aç
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Node.js port'unu sadece localhost için aç (güvenlik)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="3000" accept'

sudo firewall-cmd --reload

# Firewall kurallarını kontrol et
sudo firewall-cmd --list-all
```

### 4. SELinux Ayarları
```bash
# SELinux durumu kontrol
sestatus

# Apache proxy için SELinux izinleri
sudo setsebool -P httpd_can_network_connect 1
sudo setsebool -P httpd_can_network_relay 1

# Gerekirse SELinux'u permissive mode'a al (geçici)
sudo setenforce 0
```

## 📦 Gerekli Programların Kurulumu

### 1. Node.js Kurulumu (NodeSource Repository)
```bash
# NodeSource repository ekle
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Node.js kurulumu
sudo dnf install -y nodejs

# Versiyon kontrol
node --version
npm --version
```

### 2. PM2 Process Manager
```bash
# PM2 global kurulumu
sudo npm install -g pm2

# PM2 sistemd service oluştur
pm2 startup systemd
# Çıktıdaki komutu çalıştır (örnek):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

### 3. Apache Web Server Kurulumu
```bash
# Apache ve SSL modülü kurulumu
sudo dnf install -y httpd mod_ssl

# Apache'yi başlat ve enable et
sudo systemctl start httpd
sudo systemctl enable httpd

# Apache durumu kontrol
sudo systemctl status httpd
```

### 4. Apache Modüllerini Aktif Et
```bash
# Gerekli modülleri otomatik aktif et
echo "LoadModule proxy_module modules/mod_proxy.so" | sudo tee -a /etc/httpd/conf.modules.d/00-proxy.conf
echo "LoadModule proxy_http_module modules/mod_proxy_http.so" | sudo tee -a /etc/httpd/conf.modules.d/00-proxy.conf
echo "LoadModule proxy_connect_module modules/mod_proxy_connect.so" | sudo tee -a /etc/httpd/conf.modules.d/00-proxy.conf
echo "LoadModule headers_module modules/mod_headers.so" | sudo tee -a /etc/httpd/conf.modules.d/00-base.conf
echo "LoadModule rewrite_module modules/mod_rewrite.so" | sudo tee -a /etc/httpd/conf.modules.d/00-base.conf
echo "LoadModule deflate_module modules/mod_deflate.so" | sudo tee -a /etc/httpd/conf.modules.d/00-base.conf
echo "LoadModule expires_module modules/mod_expires.so" | sudo tee -a /etc/httpd/conf.modules.d/00-base.conf

# Apache config'i test et
sudo httpd -t

# Apache'yi restart et
sudo systemctl restart httpd
```

## 🗄️ MongoDB Kurulumu

### Option 1: MongoDB Atlas (Önerilen)
1. [MongoDB Atlas](https://cloud.mongodb.com) hesabı oluşturun
2. Cluster oluşturun
3. Network Access'de sunucu IP'sini whitelist'e ekleyin
4. Connection string'i alın:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hygieia_production
   ```

### Option 2: Local MongoDB (AlmaLinux)
```bash
# MongoDB repository ekle
sudo vim /etc/yum.repos.d/mongodb-org-7.0.repo

# Dosya içeriği:
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc

# MongoDB kurulumu
sudo dnf install -y mongodb-org

# MongoDB'yi başlat ve enable et
sudo systemctl start mongod
sudo systemctl enable mongod

# MongoDB durumu kontrol
sudo systemctl status mongod

# MongoDB güvenlik ayarları
sudo vim /etc/mongod.conf
# security:
#   authorization: enabled

# Admin kullanıcı oluştur
mongosh
> use admin
> db.createUser({
    user: "vader",
    pwd: "V01v0203!+"
    roles: ["root"]
  })

mongosh
    use admin
    db.createUser({
        user: "vader",
        pwd: "V01v0203"
        roles: ["root"]
    })

# Connection string:
# mongodb://vader:V01v0203@localhost:27017/hygieia_production?authSource=admin
```

## 📁 Dosya Yapısı Hazırlığı

```bash
# Proje klasörü oluştur
sudo mkdir -p /var/www/hygieiatr_admin

# Kullanıcı sahipliği ver
sudo chown -R $USER:$USER /var/www/hygieiatr_admin

# İzinleri ayarla
chmod 755 /var/www/hygieiatr_admin
```

## 🔐 Environment Variables

`.env.production` dosyası oluşturun:
```bash
cd /var/www/hygieiatr_admin
vim .env.production
```

İçeriği:
```env
# MongoDB Database URL
MONGODB_URI=mongodb://vader:V01v0203!+@localhost:27017/hygieia_production?authSource=admin

# JWT Secret Key (Güçlü bir secret)
JWT_SECRET=9f8aefdbaa80fe722cfc9247fd1f802d

# Environment
NODE_ENV=production

# Application URL
NEXTAUTH_URL=https://admin.hygieiatr.com

# Port (Node.js internal port)
PORT=3000
```

Dosya izinlerini ayarla:
```bash
chmod 600 .env.production
```

## 📦 Deployment Adımları

### 1. Kodu Sunucuya Yükleme
```bash
# Git ile clone
cd /var/www
sudo git clone https://github.com/yourusername/hygieia_v4.git hygieia-v4
sudo chown -R $USER:$USER hygieia-v4

# Veya dosyaları SCP/FTP ile yükleyin
# scp -r /var/www/hygieiatr_admin/ user@almalinux-server:/var/www/
```

### 2. Node.js Uygulamasını Hazırlama
```bash
cd /var/www/hygieiatr_admin

# Environment variables'ları export et
export MONGODB_URI="mongodb://vader:V01v0203@localhost:27017/hygieia_production?authSource=admin"
export JWT_SECRET="9f8aefdbaa80fe722cfc9247fd1f802d"
export NODE_ENV="production"
export PORT=3000

# Dependencies yükle
npm ci --production

# Build yap
npm run build

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
```

### 3. Apache Virtual Host Yapılandırması
```bash
# Virtual host dosyası oluştur
sudo vim /etc/apache2/conf.d/hygieia-admin.conf
```

**Dosya içeriği:**
```apache
<VirtualHost *:80>
    ServerName admin.hygieiatr.com
    ServerAlias admin.hygieiatr.com
    
    DocumentRoot /var/www/hygieiatr_admin
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'"
    
    # Gzip Compression
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Static files caching
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 month"
        Header append Cache-Control "public, immutable"
    </LocationMatch>
    
    # Next.js static files
    ProxyPreserveHost On
    ProxyPass /_next/static/ http://127.0.0.1:3000/_next/static/
    ProxyPassReverse /_next/static/ http://127.0.0.1:3000/_next/static/
    
    # API routes
    ProxyPass /api/ http://127.0.0.1:3000/api/
    ProxyPassReverse /api/ http://127.0.0.1:3000/api/
    
    # Main application
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    # WebSocket support (Next.js HMR)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://127.0.0.1:3000/$1" [P,L]
    
    # Health check
    <Location "/health">
        ProxyPass http://127.0.0.1:3000/health
        ProxyPassReverse http://127.0.0.1:3000/health
    </Location>
    
    # Logging
    ErrorLog /var/log/httpd/hygieia_admin_error.log
    CustomLog /var/log/httpd/hygieia_admin_access.log combined
</VirtualHost>
```

### 4. Apache Konfigürasyonunu Test ve Başlatma
```bash
# Apache config'i test et
sudo httpd -t

# Apache'yi restart et
sudo systemctl restart httpd

# Status kontrol
sudo systemctl status httpd
```

## 🔒 SSL Certificate (Let's Encrypt)

### 1. Certbot Kurulumu
```bash
# Snapd kurulumu (AlmaLinux 9)
sudo dnf install -y snapd
sudo systemctl enable --now snapd.socket
sudo ln -s /var/lib/snapd/snap /snap

# Certbot kurulumu
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Certbot link oluştur
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Apache plugin kurulumu
sudo dnf install -y python3-certbot-apache
```

### 2. SSL Certificate Alma
```bash
# Apache için SSL certificate
sudo certbot --apache -d admin.hygieiatr.com -d admin.hygieiatr.com

# Otomatik yenileme testi
sudo certbot renew --dry-run

# Crontab ile otomatik yenileme
sudo crontab -e
# Ekle: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🗄️ Database Seeding

İlk kez deploy sonrası seed data yükleyin:
```bash
cd /var/www/hygieia-v4

# Environment variables yükle
source .env.production

# Seed data çalıştır
npm run seed
```

Bu komut aşağıdaki verileri oluşturur:
- Admin kullanıcısı (`admin@hygieia.com` / `admin123`)
- Sample kategoriler ve ürünler
- Test siparişleri

## 🔧 PM2 ve Apache Yönetimi

### PM2 Temel Komutları
```bash
# Status kontrol
pm2 status

# Logları görüntüle
pm2 logs hygieia-v4

# Restart
pm2 restart hygieia-v4

# Stop
pm2 stop hygieia-v4

# Delete
pm2 delete hygieia-v4

# Monitoring dashboard
pm2 monit

# Sistem kaynaklarını izle
pm2 show hygieia-v4
```

### Apache Yönetimi
```bash
# Apache durumu
sudo systemctl status httpd

# Apache restart
sudo systemctl restart httpd

# Apache reload (config değişikliği sonrası)
sudo systemctl reload httpd

# Apache config test
sudo httpd -t
```

## 📊 Apache Monitoring Setup

### 1. Apache Status Modülü
```bash
# Status modülünü aktif et
echo "LoadModule status_module modules/mod_status.so" | sudo tee -a /etc/httpd/conf.modules.d/00-base.conf

# Status sayfası config
sudo vim /etc/apache2/conf.d/status.conf
```

**Status config içeriği:**
```apache
<Location "/server-status">
    SetHandler server-status
    Require local
</Location>

<Location "/server-info">
    SetHandler server-info
    Require local
</Location>
```

### 2. Log Monitoring
```bash
# Apache access logları
sudo tail -f /var/log/httpd/hygieia-admin_access.log

# Apache error logları
sudo tail -f /var/log/httpd/hygieia-admin_error.log

# SSL logları (SSL kurulumu sonrası)
sudo tail -f /var/log/httpd/hygieia-admin_ssl_access.log
sudo tail -f /var/log/httpd/hygieia-admin_ssl_error.log

# System logs
sudo journalctl -u httpd -f
sudo journalctl -u pm2-$USER -f
```

### 3. Performance Monitoring
```bash
# AlmaLinux sistem monitoring araçları
sudo dnf install -y sysstat iotop nethogs

# CPU, Memory, I/O monitoring
iostat -x 1
vmstat 1
sar -u 1 5

# Network connections
ss -tulpn | grep :80
ss -tulpn | grep :443
ss -tulpn | grep :3000

# Apache processes
sudo ps aux | grep httpd

# Server status
curl http://localhost/server-status
```

## 🛡️ Security Hardening

### 1. Apache Security
```bash
# Apache security config
sudo vim /etc/apache2/conf.d/security.conf
```

**Security config içeriği:**
```apache
# Hide Apache version
ServerTokens Prod
ServerSignature Off

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer-when-downgrade"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Disable unnecessary HTTP methods
<Location />
    <LimitExcept GET POST PUT DELETE>
        Require all denied
    </LimitExcept>
</Location>

# Disable server info
<Directory />
    Options -Indexes -Includes -ExecCGI
    AllowOverride None
</Directory>
```

### 2. SSH Security
```bash
# SSH config güvenlik ayarları
sudo vim /etc/ssh/sshd_config

# Önerilen ayarlar:
# Port 2222                    # Default port değiştir
# PermitRootLogin no
# PasswordAuthentication no    # Sadece key-based auth
# AllowUsers yourusername

sudo systemctl restart sshd
```

### 3. Fail2Ban Installation
```bash
# Fail2Ban kurulumu
sudo dnf install -y fail2ban

# Apache jail konfigürasyonu
sudo vim /etc/fail2ban/jail.local
```

**Jail config:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[httpd-auth]
enabled = true

[httpd-badbots]
enabled = true

[httpd-botsearch]
enabled = true
```

```bash
# Fail2Ban başlat
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Status kontrol
sudo fail2ban-client status
```

## 🚀 Deployment Script Güncellemesi

Deployment script'i Apache için güncelleyin:

```bash
# deploy.sh'ı güncelle
vim /var/www/hygieia-v4/deploy.sh
```

**Güncellenen deploy.sh içeriği:**
```bash
#!/bin/bash

echo "🚀 Starting Hygieia v4 deployment (Apache + Node.js)..."

# Environment check
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI environment variable is not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET environment variable is not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🏗️ Building application..."
npm run build

# Start with PM2
echo "🔄 Starting Node.js application with PM2..."
pm2 stop hygieia-v4 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Restart Apache
echo "🔄 Restarting Apache..."
sudo systemctl restart httpd

echo "✅ Deployment completed!"
echo "🌐 Application is running behind Apache on port 80/443"
echo "📊 Check status: pm2 status && sudo systemctl status httpd"
echo "📝 Check logs: pm2 logs hygieia-v4"
echo "🌐 Apache logs: sudo tail -f /var/log/httpd/hygieia_access.log"
echo "🔍 Test: curl http://localhost"
```

**Script'i çalıştırılabilir yap:**
```bash
chmod +x /var/www/hygieia-v4/deploy.sh
```

## 🎯 Test ve Doğrulama

### 1. Temel Testler
```bash
# Apache config test
sudo httpd -t

# Apache restart
sudo systemctl restart httpd

# HTTP test
curl http://localhost

# Node.js app direct test
curl http://localhost:3000

# Full proxy test
curl -H "Host: yourdomain.com" http://localhost

# SSL test (SSL kurulumu sonrası)
curl https://yourdomain.com
```

### 2. Detaylı Test
```bash
# Headers test
curl -I http://localhost

# API test
curl http://localhost/api/auth/me

# Static files test
curl http://localhost/_next/static/

# WebSocket test (development)
curl -H "Upgrade: websocket" -H "Connection: upgrade" http://localhost
```

## 📊 Production Checklist

- [ ] AlmaLinux 9.6.0 güncellemeleri yapıldı
- [ ] Firewall kuralları ayarlandı (HTTP, HTTPS)
- [ ] SELinux ayarları yapıldı (httpd_can_network_connect)
- [ ] Node.js 18+ kuruldu
- [ ] PM2 kuruldu ve systemd entegrasyonu yapıldı
- [ ] Apache kuruldu ve modüller aktif edildi
- [ ] MongoDB bağlantısı test edildi
- [ ] Environment variables ayarlandı
- [ ] Build başarılı oldu
- [ ] PM2 ile Node.js uygulaması çalışıyor
- [ ] Apache virtual host yapılandırıldı
- [ ] SSL certificate kuruldu (Let's Encrypt)
- [ ] Database seed data yüklendi
- [ ] Apache ve PM2 monitoring setup yapıldı
- [ ] Security hardening tamamlandı
- [ ] Backup stratejisi belirlendi

## 🎯 Production URLs

- **HTTP**: `http://yourdomain.com` → Apache → Node.js (port 3000)
- **HTTPS**: `https://yourdomain.com` → Apache → Node.js (port 3000)
- **Dashboard**: `https://yourdomain.com/dashboard`
- **Login**: `https://yourdomain.com/login`
- **API**: `https://yourdomain.com/api/*`

## 🔄 Updates & Maintenance

### Code Update
```bash
cd /var/www/hygieia-v4

# Git güncellemesi
git pull origin main

# Dependencies güncelle
npm ci --production

# Yeniden build
npm run build

# PM2 restart
pm2 restart hygieia-v4

# Apache reload (gerekirse)
sudo systemctl reload httpd
```

### System Updates
```bash
# AlmaLinux sistem güncellemeleri
sudo dnf update -y

# Node.js güncelleme (gerekirse)
sudo dnf update nodejs npm

# PM2 güncelleme
sudo npm update -g pm2

# Apache güncelleme
sudo dnf update httpd
```

### Database Backup
```bash
# MongoDB Atlas: Automatic backups available

# Local MongoDB backup
mongodump --uri="mongodb://admin:password@localhost:27017/hygieia_production?authSource=admin" --out /backup/$(date +%Y%m%d)

# Backup script oluştur
sudo vim /usr/local/bin/backup-hygieia.sh
#!/bin/bash
BACKUP_DIR="/backup/hygieia/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out $BACKUP_DIR
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

sudo chmod +x /usr/local/bin/backup-hygieia.sh

# Crontab ile otomatik backup
sudo crontab -e
# Ekle: 0 2 * * * /usr/local/bin/backup-hygieia.sh
```

## 🆘 Troubleshooting

### 1. Apache Issues
```bash
# Apache won't start
sudo systemctl status httpd
sudo journalctl -xeu httpd

# Config syntax error
sudo httpd -t

# Port conflict
sudo ss -tulpn | grep :80

# Permission denied
sudo setsebool -P httpd_can_network_connect 1
```

### 2. Node.js Issues
```bash
# PM2 app not running
pm2 status
pm2 logs hygieia-v4

# Port 3000 issue
sudo ss -tulpn | grep :3000
sudo lsof -i :3000
```

### 3. Proxy Issues
```bash
# Apache to Node.js connection
curl http://localhost:3000
curl http://localhost

# Check proxy headers
curl -I http://localhost
```

### 4. SSL Issues
```bash
# Certificate check
sudo certbot certificates

# SSL renewal test
sudo certbot renew --dry-run

# SSL config test
openssl s_client -connect yourdomain.com:443
```

### 5. SELinux Issues
```bash
# SELinux denials
sudo sealert -a /var/log/audit/audit.log

# Allow Apache network connections
sudo setsebool -P httpd_can_network_connect 1
sudo setsebool -P httpd_can_network_relay 1

# Check SELinux context
ls -Z /var/www/hygieia-v4
```

---
**🎉 AlmaLinux 9.6.0'da Apache + Node.js Hygieia v4 Deployment Rehberi Hazır! 🚀🐧** 