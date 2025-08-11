const mongoose = require('mongoose');

// MongoDB URI - normalde .env dosyasından gelir
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cluster0.rjf2p.mongodb.net/hygieia_v4?retryWrites=true&w=majority';

// Product model schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  wholesalePrice: { type: Number, required: true },
  retailPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  unit: { type: String, default: 'adet' },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String,
  },
  tags: [String],
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  images: [String],
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

const sampleProducts = [
  {
    name: 'Ergonomik Ofis Koltuğu',
    description: 'Lomber desteği olan, ayarlanabilir yükseklik özellikli premium ofis koltuğu.',
    sku: 'OFK-001',
    category: 'Ofis Malzemeleri',
    wholesalePrice: 850.00,
    retailPrice: 1200.00,
    stock: 25,
    minStock: 5,
    unit: 'adet',
    weight: 18.5,
    dimensions: { length: 65, width: 65, height: 120 },
    supplier: {
      name: 'Ergon Mobilya Ltd.',
      contact: 'Ahmet Yılmaz',
      email: 'ahmet@ergon.com',
      phone: '+90 212 555 0101'
    },
    tags: ['ergonomik', 'ofis', 'koltuğu', 'premium'],
    status: 'active'
  },
  {
    name: 'Samsung 4K Monitör 27"',
    description: '27 inç 4K UHD çözünürlüklü profesyonel monitör, HDR desteği.',
    sku: 'MON-027',
    category: 'Elektronik',
    wholesalePrice: 2400.00,
    retailPrice: 3200.00,
    stock: 15,
    minStock: 3,
    unit: 'adet',
    weight: 6.8,
    dimensions: { length: 61, width: 19, height: 46 },
    supplier: {
      name: 'TechPro Dağıtım',
      contact: 'Elif Kaya',
      email: 'elif@techpro.com',
      phone: '+90 216 555 0202'
    },
    tags: ['4k', 'monitör', 'samsung', 'profesyonel'],
    status: 'active'
  },
  {
    name: 'Organik Zeytinyağı 1L',
    description: 'Soğuk sıkım organik zeytinyağı, sertifikalı üretim.',
    sku: 'ZYG-1000',
    category: 'Gıda & İçecek',
    wholesalePrice: 35.00,
    retailPrice: 65.00,
    stock: 120,
    minStock: 20,
    unit: 'şişe',
    weight: 1.1,
    dimensions: { length: 8, width: 8, height: 28 },
    supplier: {
      name: 'Ege Zeytinyağı Kooperatifi',
      contact: 'Mehmet Özkan',
      email: 'mehmet@egezeytin.com',
      phone: '+90 232 555 0303'
    },
    tags: ['organik', 'zeytinyağı', 'doğal', 'soğuk-sıkım'],
    status: 'active'
  },
  {
    name: 'Premium Kahve Makinesi',
    description: 'Otomatik espresso makinesi, çekirdek öğütücü dahil.',
    sku: 'KHV-ESP-01',
    category: 'Ev & Bahçe',
    wholesalePrice: 1250.00,
    retailPrice: 1800.00,
    stock: 8,
    minStock: 2,
    unit: 'adet',
    weight: 12.5,
    dimensions: { length: 35, width: 40, height: 45 },
    supplier: {
      name: 'Barista Equipment Ltd.',
      contact: 'Seda Demir',
      email: 'seda@barista.com',
      phone: '+90 212 555 0404'
    },
    tags: ['kahve', 'espresso', 'otomatik', 'premium'],
    status: 'active'
  },
  {
    name: 'Fitness Yoga Matı',
    description: 'Anti-slip yüzey, 6mm kalınlık, TPE malzeme.',
    sku: 'YOG-MAT-06',
    category: 'Spor & Outdoor',
    wholesalePrice: 45.00,
    retailPrice: 85.00,
    stock: 50,
    minStock: 10,
    unit: 'adet',
    weight: 1.2,
    dimensions: { length: 183, width: 61, height: 0.6 },
    supplier: {
      name: 'FitLife Spor Malzemeleri',
      contact: 'Can Öztürk',
      email: 'can@fitlife.com',
      phone: '+90 216 555 0505'
    },
    tags: ['yoga', 'fitness', 'mat', 'anti-slip'],
    status: 'active'
  },
  {
    name: 'Dermatolog Onaylı Nemlendirici',
    description: 'Hassas ciltler için hipoalerjenik günlük nemlendirici krem.',
    sku: 'NEM-50ML',
    category: 'Sağlık & Güzellik',
    wholesalePrice: 28.00,
    retailPrice: 55.00,
    stock: 75,
    minStock: 15,
    unit: 'tüp',
    weight: 0.08,
    dimensions: { length: 4, width: 4, height: 12 },
    supplier: {
      name: 'DermaCare Kozmetik',
      contact: 'Dr. Ayşe Çelik',
      email: 'ayse@dermacare.com',
      phone: '+90 212 555 0606'
    },
    tags: ['dermatolog', 'nemlendirici', 'hipoalerjenik', 'günlük'],
    status: 'active'
  },
  {
    name: 'Endüstriyel Matkap Seti',
    description: '18V şarjlı matkap, 42 parça aksesuar seti dahil.',
    sku: 'MTK-18V-SET',
    category: 'Makine & Ekipman',
    wholesalePrice: 320.00,
    retailPrice: 500.00,
    stock: 12,
    minStock: 3,
    unit: 'set',
    weight: 3.2,
    dimensions: { length: 35, width: 25, height: 15 },
    supplier: {
      name: 'ProTools Endüstriyel',
      contact: 'Mustafa Kılıç',
      email: 'mustafa@protools.com',
      phone: '+90 312 555 0707'
    },
    tags: ['matkap', 'şarjlı', 'endüstriyel', 'aksesuar'],
    status: 'active'
  },
  {
    name: 'Organik Pamuk T-Shirt',
    description: '%100 organik pamuk, unisex kesim, çevre dostu boyalar.',
    sku: 'TSH-ORG-M',
    category: 'Giyim & Tekstil',
    wholesalePrice: 25.00,
    retailPrice: 45.00,
    stock: 200,
    minStock: 30,
    unit: 'adet',
    weight: 0.18,
    dimensions: { length: 30, width: 25, height: 1 },
    supplier: {
      name: 'EcoFashion Tekstil',
      contact: 'Zeynep Arslan',
      email: 'zeynep@ecofashion.com',
      phone: '+90 216 555 0808'
    },
    tags: ['organik', 'pamuk', 'unisex', 'çevre-dostu'],
    status: 'active'
  },
  {
    name: 'Araba Lastik Seti (4 Adet)',
    description: '205/55 R16 ebat, dört mevsim lastik, A sınıfı yakıt ekonomisi.',
    sku: 'LST-205-55-R16',
    category: 'Otomotiv',
    wholesalePrice: 1400.00,
    retailPrice: 2000.00,
    stock: 6,
    minStock: 2,
    unit: 'set',
    weight: 32.0,
    dimensions: { length: 63, width: 63, height: 25 },
    supplier: {
      name: 'TireMax Otomotiv',
      contact: 'Hakan Yurt',
      email: 'hakan@tiremax.com',
      phone: '+90 312 555 0909'
    },
    tags: ['lastik', 'dört-mevsim', 'A-sınıfı', 'yakıt-ekonomisi'],
    status: 'active'
  },
  {
    name: 'JavaScript Programlama Kitabı',
    description: 'Modern JavaScript geliştirme teknikleri, ES6+ örnekleri.',
    sku: 'KTB-JS-2024',
    category: 'Kitap & Medya',
    wholesalePrice: 35.00,
    retailPrice: 65.00,
    stock: 40,
    minStock: 8,
    unit: 'adet',
    weight: 0.5,
    dimensions: { length: 19, width: 13, height: 3 },
    supplier: {
      name: 'TechBooks Yayınevi',
      contact: 'Ali Şahin',
      email: 'ali@techbooks.com',
      phone: '+90 212 555 1010'
    },
    tags: ['javascript', 'programlama', 'ES6', 'modern'],
    status: 'active'
  },
  {
    name: 'Duvar Boyası 15L (Beyaz)',
    description: 'İç mekan duvar boyası, kokusuz, hızlı kuruyan formül.',
    sku: 'BOY-15L-BYZ',
    category: 'İnşaat & Yapı',
    wholesalePrice: 180.00,
    retailPrice: 280.00,
    stock: 30,
    minStock: 5,
    unit: 'teneke',
    weight: 18.0,
    dimensions: { length: 25, width: 25, height: 35 },
    supplier: {
      name: 'PaintPro İnşaat',
      contact: 'Fatma Yılmaz',
      email: 'fatma@paintpro.com',
      phone: '+90 312 555 1111'
    },
    tags: ['duvar', 'boyası', 'kokusuz', 'beyaz'],
    status: 'active'
  },
  {
    name: 'Laboratuvar Test Tüpü (100 Adet)',
    description: 'Borosilikat cam test tüpleri, steril ambalaj.',
    sku: 'LAB-TT-100',
    category: 'Kimya & Laboratuvar',
    wholesalePrice: 85.00,
    retailPrice: 140.00,
    stock: 20,
    minStock: 5,
    unit: 'paket',
    weight: 1.5,
    dimensions: { length: 20, width: 15, height: 10 },
    supplier: {
      name: 'LabGlass Bilimsel',
      contact: 'Dr. Emre Kara',
      email: 'emre@labglass.com',
      phone: '+90 216 555 1212'
    },
    tags: ['test-tüpü', 'borosilikat', 'steril', 'laboratuvar'],
    status: 'active'
  },
  // Düşük stoklu ürün örneği
  {
    name: 'Premium Kahve Çekirdek 1kg',
    description: 'Kolombiya origin, single estate, orta kavrum.',
    sku: 'KHV-COL-1KG',
    category: 'Gıda & İçecek',
    wholesalePrice: 120.00,
    retailPrice: 180.00,
    stock: 2, // Düşük stok uyarısı için
    minStock: 5,
    unit: 'kg',
    weight: 1.0,
    dimensions: { length: 15, width: 8, height: 25 },
    supplier: {
      name: 'Coffee Masters',
      contact: 'İbrahim Özgür',
      email: 'ibrahim@coffeemasters.com',
      phone: '+90 212 555 1313'
    },
    tags: ['kahve', 'kolombiya', 'single-estate', 'premium'],
    status: 'active'
  },
  // Taslak ürün örneği
  {
    name: 'Akıllı Bileklik Pro',
    description: 'Nabız takip, uyku analizi, 7 gün pil ömrü.',
    sku: 'SWT-PRO-01',
    category: 'Elektronik',
    wholesalePrice: 450.00,
    retailPrice: 700.00,
    stock: 0,
    minStock: 10,
    unit: 'adet',
    weight: 0.04,
    dimensions: { length: 4, width: 3, height: 1 },
    supplier: {
      name: 'SmartTech Innovations',
      contact: 'Deniz Kaya',
      email: 'deniz@smarttech.com',
      phone: '+90 216 555 1414'
    },
    tags: ['akıllı', 'bileklik', 'nabız', 'uyku'],
    status: 'draft' // Taslak durumda
  }
];

async function seedProducts() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut ürünleri temizle
    await Product.deleteMany({});
    console.log('🗑️ Mevcut ürün verileri temizlendi');

    // Demo ürünleri ekle
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ ${insertedProducts.length} demo ürün başarıyla eklendi`);

    // İstatistikleri göster
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgWholesalePrice: { $avg: '$wholesalePrice' },
          avgRetailPrice: { $avg: '$retailPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Ürün Kategorileri:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} ürün (Ortalama toptan: ${stat.avgWholesalePrice.toFixed(2)} TL)`);
    });

    // Düşük stoklu ürünleri kontrol et
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$minStock'] }
    });

    if (lowStockProducts.length > 0) {
      console.log(`\n⚠️ ${lowStockProducts.length} ürün düşük stokta:`);
      lowStockProducts.forEach(product => {
        console.log(`  - ${product.name} (${product.stock}/${product.minStock})`);
      });
    }

    console.log('\n🎉 Demo ürün verisi başarıyla oluşturuldu!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
seedProducts(); 