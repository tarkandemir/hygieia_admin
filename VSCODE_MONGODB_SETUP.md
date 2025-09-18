# 🔧 VSCode MongoDB Extension ile Database Kurulumu

Bu rehber VSCode MongoDB Extension kullanarak Hygieia uygulaması için gerekli veritabanı şemasını ve demo verileri kurmanızı gösterir.

## 📋 Ön Gereksinimler

1. ✅ **VSCode** yüklü olmalı
2. ✅ **MongoDB for VS Code** extension yüklü olmalı
3. ✅ **MongoDB Atlas** hesabı oluşturulmuş olmalı
4. ✅ **Connection String** hazır olmalı

## 🚀 Adım Adım Kurulum

### 1️⃣ VSCode MongoDB Extension Kurulumu

1. VSCode'u açın
2. Extensions panelini açın (`Ctrl+Shift+X`)
3. "MongoDB for VS Code" arayın
4. MongoDB Inc. tarafından geliştirilen extension'ı kurun

### 2️⃣ MongoDB Atlas'a Bağlanma

1. VSCode'da `Ctrl+Shift+P` tuşlayın
2. "MongoDB: Connect" yazın ve seçin
3. Connection string'inizi girin:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/
   ```
4. Bağlantı adını girin (örn: "Hygieia Atlas")

### 3️⃣ Playground Dosyasını Açma

1. Explorer panelinde `mongodb-playground/hygieia-complete-setup.mongodb` dosyasını açın
2. Dosyanın üst kısmında database adını kontrol edin:
   ```javascript
   const database = 'hygieia';
   ```

### 4️⃣ Script'i Çalıştırma

**Seçenek 1: Tüm Script'i Çalıştırma**
1. `Ctrl+A` ile tüm kodu seçin
2. `Ctrl+Shift+P` → "MongoDB: Run Selected Lines From Playground"
3. Veya dosya içinde sağ tık → "Run All"

**Seçenek 2: Bölüm Bölüm Çalıştırma**
1. İlk bölümü seçin (örn: Users kısmı)
2. `Ctrl+Shift+P` → "MongoDB: Run Selected Lines From Playground"
3. Her bölümü sırayla çalıştırın

### 5️⃣ Sonucu Kontrol Etme

1. VSCode'da MongoDB panelini açın
2. Connection'ınızı genişletin
3. `hygieia` database'ini genişletin
4. Koleksiyonları görmeniz gerekir:
   - `users` (3 kayıt)
   - `categories` (10 kayıt)
   - `products` (5 kayıt)
   - `orders` (2 kayıt)
   - `settings` (6 kayıt)
   - `notifications` (3 kayıt)

## 📊 Oluşturulacak Şema Yapısı

### 🏗️ Koleksiyonlar ve Yapıları

```javascript
// Users Collection
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: 'admin' | 'manager' | 'employee',
  permissions: String[],
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

// Categories Collection
{
  name: String (unique),
  description: String,
  icon: String,
  color: String,
  order: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Products Collection
{
  name: String,
  description: String,
  sku: String (unique),
  barcode: String,
  category: String,
  brand: String,
  price: {
    wholesale: Number,
    retail: Number,
    currency: String
  },
  stock: {
    quantity: Number,
    minStockLevel: Number,
    unit: String
  },
  dimensions: {
    weight: Number,
    length: Number,
    width: Number,
    height: Number
  },
  images: String[],
  status: 'active' | 'inactive' | 'draft',
  tags: String[],
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  },
  isB2BOnly: Boolean,
  minimumOrderQuantity: Number,
  createdAt: Date,
  updatedAt: Date
}

// Orders Collection
{
  orderNumber: String (unique),
  customer: {
    name: String,
    email: String,
    phone: String,
    company: String,
    taxNumber: String,
    billingAddress: Object,
    shippingAddress: Object
  },
  items: [{
    product: ObjectId,
    sku: String,
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentMethod: String,
  subtotal: Number,
  taxAmount: Number,
  shippingCost: Number,
  totalAmount: Number,
  currency: String,
  notes: String,
  estimatedDeliveryDate: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Settings Collection
{
  key: String (unique),
  value: Mixed,
  description: String,
  category: String,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Notifications Collection
{
  title: String,
  message: String,
  type: 'info' | 'success' | 'warning' | 'error',
  userId: ObjectId,
  isRead: Boolean,
  action: {
    type: String,
    url: String,
    label: String
  },
  metadata: Object,
  createdAt: Date
}
```

## 🔍 Oluşturulan Index'ler

Script otomatik olarak şu index'leri oluşturur:

```javascript
// Users
{ email: 1 } (unique)
{ role: 1 }

// Categories
{ name: 1 } (unique)
{ order: 1 }

// Products
{ sku: 1 } (unique)
{ category: 1 }
{ brand: 1 }
{ status: 1 }
{ "price.wholesale": 1 }

// Orders
{ orderNumber: 1 } (unique)
{ status: 1 }
{ paymentStatus: 1 }
{ createdAt: -1 }
{ "customer.email": 1 }

// Settings
{ key: 1 } (unique)
{ category: 1 }

// Notifications
{ userId: 1 }
{ isRead: 1 }
{ createdAt: -1 }
```

## 🔑 Demo Hesaplar

Script çalıştıktan sonra şu demo hesaplarla giriş yapabilirsiniz:

| Email | Şifre | Rol | Açıklama |
|-------|-------|-----|----------|
| `admin@hygieia.com` | `123456` | admin | Tam yetki |
| `manager@hygieia.com` | `123456` | manager | Yönetici yetkisi |
| `employee@hygieia.com` | `123456` | employee | Çalışan yetkisi |

## 🚨 Sorun Giderme

### Bağlantı Hatası
```
Failed to connect to MongoDB
```
**Çözüm**: Connection string'inizi ve IP whitelist'inizi kontrol edin

### Yetki Hatası
```
Authentication failed
```
**Çözüm**: Kullanıcı adı ve şifrenizi kontrol edin

### Database Bulunamadı
```
Database not found
```
**Çözüm**: Script çalıştırıldıktan sonra veritabanı otomatik oluşur

### Duplicate Key Hatası
```
E11000 duplicate key error
```
**Çözüm**: Script'in başındaki `drop()` komutları ile koleksiyonları temizleyin

## 💡 İpuçları

1. **Kısmi Çalıştırma**: Script'i bölüm bölüm çalıştırarak sorunları izole edebilirsiniz
2. **Output Panel**: VSCode'da Output panelinden MongoDB loglarını takip edin
3. **IntelliSense**: MongoDB extension otomatik tamamlama sağlar
4. **Query Testing**: Playground'da MongoDB querylerini test edebilirsiniz

## 🎯 Sonraki Adımlar

✅ Database şeması oluşturuldu  
✅ Demo veriler yüklendi  
✅ Index'ler oluşturuldu  
✅ Demo hesaplar hazır  

**Şimdi yapabilecekleriniz:**
1. 🚀 Next.js uygulamasını başlatın (`npm run dev`)
2. 🔐 Demo hesaplarla giriş yapın
3. 📊 Dashboard'ı keşfedin
4. 🛒 Yeni siparişler oluşturun
5. 📦 Ürün yönetimini test edin

## 🔄 Verileri Yeniden Yükleme

Verileri sıfırlamak için:
1. Playground'da sadece `drop()` komutlarını çalıştırın
2. Sonra tüm `insertMany()` komutlarını tekrar çalıştırın

Başarılar! 🎉 