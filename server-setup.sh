#!/bin/bash

# GoDaddy VPS Otomatik Kurulum Scripti
# AlmaLinux 9 + cPanel + Node.js + MongoDB + Nginx

set -e  # Hata durumunda scripti durdur

echo "🌟 GoDaddy VPS Kurulum Scripti Başlatılıyor..."
echo "📋 AlmaLinux 9 + Node.js + MongoDB + Nginx kurulumu"
echo ""

# Root kontrolü
if [[ $EUID -ne 0 ]]; then
   echo "❌ Bu script root kullanıcısı ile çalıştırılmalıdır (sudo)" 
   exit 1
fi

# Sistem güncellemesi
echo "📦 Sistem güncelleniyor..."
dnf update -y
dnf upgrade -y

# Git kurulumu
echo "🔧 Git kuruluyor..."
dnf install git -y

# NVM ve Node.js kurulumu
echo "📦 Node.js kuruluyor..."
# Root için NVM kurulumu
export NVM_DIR="/root/.nvm"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source /root/.nvm/nvm.sh

# Node.js 20 LTS kurulumu
nvm install 20
nvm use 20
nvm alias default 20

# Node.js'in sistem genelinde kullanılabilir olması için
ln -sf /root/.nvm/versions/node/$(nvm version)/bin/node /usr/local/bin/node
ln -sf /root/.nvm/versions/node/$(nvm version)/bin/npm /usr/local/bin/npm
ln -sf /root/.nvm/versions/node/$(nvm version)/bin/npx /usr/local/bin/npx

# MongoDB Repository kurulumu
echo "🗄️ MongoDB kuruluyor..."
tee /etc/yum.repos.d/mongodb-org-7.0.repo > /dev/null <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF

# MongoDB kurulumu
dnf install mongodb-org -y

# MongoDB başlatma
systemctl start mongod
systemctl enable mongod

# PM2 kurulumu
echo "⚙️ PM2 kuruluyor..."
npm install -g pm2

# Nginx kurulumu
echo "🌐 Nginx kuruluyor..."
dnf install nginx -y
systemctl start nginx
systemctl enable nginx

# Certbot kurulumu (SSL için)
echo "🔒 Certbot kuruluyor..."
dnf install certbot python3-certbot-nginx -y

# Firewall ayarları
echo "🛡️ Firewall ayarlanıyor..."
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# Proje klasörü oluşturma
echo "📁 Proje klasörü oluşturuluyor..."
mkdir -p /var/www/hygieia
chown nginx:nginx /var/www/hygieia

# MongoDB backup klasörü
mkdir -p /backup/mongodb
chown mongodb:mongodb /backup/mongodb

# PM2 başlangıç ayarları
echo "🔄 PM2 otomatik başlatma ayarlanıyor..."
pm2 startup systemd -u root --hp /root

# Backup scripti oluşturma
echo "💾 Backup scripti oluşturuluyor..."
tee /usr/local/bin/mongodb-backup.sh > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"

# Eğer auth açıksa, kullanıcı adı ve şifre ile backup al
if [ ! -z "$MONGO_USER" ] && [ ! -z "$MONGO_PASSWORD" ]; then
    mongodump --host localhost --port 27017 -u $MONGO_USER -p $MONGO_PASSWORD --authenticationDatabase hygieia --db hygieia --out $BACKUP_DIR/$DATE
else
    mongodump --host localhost --port 27017 --db hygieia --out $BACKUP_DIR/$DATE
fi

# 7 günden eski backupları sil
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
EOF

chmod +x /usr/local/bin/mongodb-backup.sh

# Nginx varsayılan konfigürasyon
echo "🔧 Nginx konfigürasyonu hazırlanıyor..."
tee /etc/nginx/conf.d/default.conf > /dev/null <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Nginx'i yeniden başlat
nginx -t && systemctl restart nginx

# Apache'yi devre dışı bırak (port 80 çakışmasını önlemek için)
echo "🚫 Apache devre dışı bırakılıyor..."
systemctl stop httpd 2>/dev/null || true
systemctl disable httpd 2>/dev/null || true

# Sistem bilgileri
echo ""
echo "✅ KURULUM TAMAMLANDI!"
echo "===================="
echo "📍 Node.js: $(node --version)"
echo "📍 NPM: $(npm --version)"
echo "📍 MongoDB: $(mongod --version | head -1)"
echo "📍 Nginx: $(nginx -v 2>&1)"
echo "📍 PM2: $(pm2 --version)"
echo ""
echo "📋 SONRAKİ ADIMLAR:"
echo "1. MongoDB kullanıcısı oluşturun:"
echo "   mongosh"
echo "   use hygieia"
echo "   db.createUser({user: 'hygieia_user', pwd: 'ŞİFRE', roles: [{role: 'readWrite', db: 'hygieia'}]})"
echo ""
echo "2. Proje dosyalarınızı /var/www/hygieia/ klasörüne yükleyin"
echo ""
echo "3. .env.local dosyası oluşturun:"
echo "   cd /var/www/hygieia"
echo "   nano .env.local"
echo ""
echo "4. Uygulamayı başlatın:"
echo "   npm install"
echo "   npm run build"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "5. Domain için Nginx konfigürasyonu yapın"
echo "6. SSL sertifikası alın: certbot --nginx -d domain.com"
echo ""
echo "🌟 HAZIR! Sunucunuz Node.js uygulaması için yapılandırıldı." 