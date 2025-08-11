# 🚀 Hızlı Başlangıç Rehberi - GoDaddy VPS

Bu rehber, GoDaddy VPS sunucunuzda Hygieia uygulamasını 15 dakikada çalıştırmanızı sağlar.

## 📋 Ön Gereksinimler
- ✅ GoDaddy VPS (AlmaLinux 9 + cPanel)  
- ✅ SSH erişimi (root veya sudo yetkisi)
- ✅ Domain adı

## ⚡ 5 Adımda Hızlı Kurulum

### 1️⃣ SSH ile Sunucuya Bağlanın
```bash
ssh root@YOUR_SERVER_IP
```

### 2️⃣ Otomatik Kurulum Scriptini Çalıştırın
```bash
# Proje dosyalarını sunucuya yükleyin (SCP/SFTP ile)
# Veya GitHub'dan clone edin

# Kurulum scriptini çalıştırın
cd /path/to/hygieia_v4
chmod +x server-setup.sh
sudo ./server-setup.sh
```

### 3️⃣ MongoDB Kullanıcısı Oluşturun
```bash
mongosh

# MongoDB shell'de:
use hygieia
db.createUser({
  user: "hygieia_user", 
  pwd: "GÜÇLÜ_ŞİFRE",
  roles: [{role: "readWrite", db: "hygieia"}]
})
exit
```

### 4️⃣ Environment Variables Ayarlayın
```bash
cd /var/www/hygieia
nano .env.local
```

Dosyaya şunu ekleyin:
```bash
MONGODB_URI=mongodb://hygieia_user:GÜÇLÜ_ŞİFRE@localhost:27017/hygieia?authSource=hygieia
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=super-secret-nextauth-key-123456789
NODE_ENV=production
```

### 5️⃣ Uygulamayı Başlatın
```bash
# Dependencies ve build
npm install
npm run build

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save

# Durum kontrolü
pm2 status
```

## 🌐 Domain ve SSL Kurulumu

### Domain Konfigürasyonu
```bash
# Nginx site konfigürasyonu
sudo nano /etc/nginx/conf.d/your-domain.conf
```

Şu içeriği ekleyin:
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

### SSL Sertifikası
```bash
# Nginx'i yeniden başlat
sudo systemctl restart nginx

# SSL sertifikası al
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🎯 Hızlı Komutlar

| Amaç | Komut |
|------|-------|
| **PM2 Durum** | `pm2 status` |
| **Logları Görüntüle** | `pm2 logs hygieia-v4` |
| **Uygulamayı Yeniden Başlat** | `pm2 restart hygieia-v4` |
| **MongoDB Durum** | `sudo systemctl status mongod` |
| **Nginx Durum** | `sudo systemctl status nginx` |
| **Port Kontrolü** | `sudo netstat -tlnp \| grep :3000` |

## 🛠️ Sorun Giderme

### Uygulama Başlamıyor?
```bash
# Logları kontrol et
pm2 logs hygieia-v4

# MongoDB bağlantısını test et
mongosh "mongodb://hygieia_user:ŞİFRE@localhost:27017/hygieia?authSource=hygieia"
```

### Port 3000 Açık Değil?
```bash
# Firewall kontrolü
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Nginx Çalışmıyor?
```bash
# Konfigürasyon testi
sudo nginx -t

# Servis yeniden başlat
sudo systemctl restart nginx
```

## 📚 Detaylı Rehber

Daha kapsamlı kurulum için: [GODADDY_DEPLOYMENT_GUIDE.md](./GODADDY_DEPLOYMENT_GUIDE.md)

## 🎉 Tamamlandı!

Uygulamanız şu adreste çalışıyor olmalı:
- **HTTP**: `http://your-domain.com`
- **HTTPS**: `https://your-domain.com` (SSL sonrası)
- **IP**: `http://SERVER_IP:3000` (test için)

---

**💡 İpucu**: GoDaddy Domain yönetiminden A kaydınızı sunucu IP'sine yönlendirmeyi unutmayın! 