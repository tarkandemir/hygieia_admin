const mongoose = require('mongoose');

// MongoDB URI - normalde .env dosyasından gelir
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cluster0.rjf2p.mongodb.net/hygieia_v4?retryWrites=true&w=majority';

// Category model schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: { type: String, default: 'cube' },
  color: { type: String, default: '#6366f1' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

const sampleCategories = [
  {
    name: 'Elektronik',
    description: 'Bilgisayar, telefon, televizyon ve elektronik cihazlar',
    icon: 'cpu-chip',
    color: '#3b82f6',
    order: 1,
    isActive: true
  },
  {
    name: 'Giyim & Tekstil',
    description: 'Kıyafet, ayakkabı ve tekstil ürünleri',
    icon: 'sparkles',
    color: '#ec4899',
    order: 2,
    isActive: true
  },
  {
    name: 'Gıda & İçecek',
    description: 'Yiyecek, içecek ve gıda ürünleri',
    icon: 'cake',
    color: '#10b981',
    order: 3,
    isActive: true
  },
  {
    name: 'Ev & Bahçe',
    description: 'Ev eşyaları, mobilya ve bahçe ürünleri',
    icon: 'home',
    color: '#f59e0b',
    order: 4,
    isActive: true
  },
  {
    name: 'Otomotiv',
    description: 'Araç yedek parçaları ve otomotiv ürünleri',
    icon: 'truck',
    color: '#6b7280',
    order: 5,
    isActive: true
  },
  {
    name: 'Spor & Outdoor',
    description: 'Spor malzemeleri ve outdoor ürünleri',
    icon: 'trophy',
    color: '#ef4444',
    order: 6,
    isActive: true
  },
  {
    name: 'Sağlık & Güzellik',
    description: 'Kozmetik, kişisel bakım ve sağlık ürünleri',
    icon: 'heart',
    color: '#8b5cf6',
    order: 7,
    isActive: true
  },
  {
    name: 'Kitap & Medya',
    description: 'Kitap, dergi ve medya ürünleri',
    icon: 'book-open',
    color: '#059669',
    order: 8,
    isActive: true
  },
  {
    name: 'Ofis Malzemeleri',
    description: 'Kırtasiye, ofis mobilyası ve büro malzemeleri',
    icon: 'briefcase',
    color: '#0891b2',
    order: 9,
    isActive: true
  },
  {
    name: 'Makine & Ekipman',
    description: 'Endüstriyel makine ve ekipmanlar',
    icon: 'cog-6-tooth',
    color: '#dc2626',
    order: 10,
    isActive: true
  },
  {
    name: 'İnşaat & Yapı',
    description: 'İnşaat malzemeleri ve yapı ürünleri',
    icon: 'wrench-screwdriver',
    color: '#ca8a04',
    order: 11,
    isActive: true
  },
  {
    name: 'Kimya & Laboratuvar',
    description: 'Kimyasal maddeler ve laboratuvar malzemeleri',
    icon: 'beaker',
    color: '#7c3aed',
    order: 12,
    isActive: true
  }
];

async function seedCategories() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut kategorileri temizle
    await Category.deleteMany({});
    console.log('🗑️ Mevcut kategori verileri temizlendi');

    // Demo kategorileri ekle
    const insertedCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ ${insertedCategories.length} demo kategori başarıyla eklendi`);

    // Kategorileri listele
    console.log('\n📊 Eklenen Kategoriler:');
    insertedCategories.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (${category.color})`);
    });

    console.log('\n🎉 Demo kategori verisi başarıyla oluşturuldu!');
    console.log('💡 Şimdi ürün formunda bu kategorileri seçebilirsiniz.');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
seedCategories(); 