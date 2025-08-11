import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../lib/mongodb';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';

async function seedData() {
  try {
    await connectToDatabase();
    
    console.log('🌱 Veri ekleme başladı...');

    // Eski verileri temizle
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Kullanıcılar oluştur
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const users = await User.create([
      {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Admin Kullanıcı',
        role: 'admin',
        permissions: ['users:*', 'products:*', 'orders:*', 'dashboard:read'],
        isActive: true,
      },
      {
        email: 'manager@test.com',
        password: hashedPassword,
        name: 'Manager Kullanıcı',
        role: 'manager',
        permissions: ['users:read', 'products:*', 'orders:*', 'dashboard:read'],
        isActive: true,
      },
      {
        email: 'employee@test.com',
        password: hashedPassword,
        name: 'Çalışan Kullanıcı',
        role: 'employee',
        permissions: ['products:read', 'orders:read', 'dashboard:read'],
        isActive: true,
      },
    ]);

    console.log('✅ Kullanıcılar oluşturuldu');

    // Ürünler oluştur
    const categories = ['Elektronik', 'Kozmetik', 'Gıda', 'Tekstil', 'Sağlık'];
    const brands = ['Marka A', 'Marka B', 'Marka C', 'Marka D', 'Marka E'];
    
    const products = [];
    for (let i = 1; i <= 50; i++) {
      products.push({
        name: `Ürün ${i}`,
        description: `Bu ürün ${i} için detaylı açıklama. B2B müşteriler için özel olarak tasarlanmıştır.`,
        sku: `SKU${String(i).padStart(3, '0')}`,
        barcode: `123456789${String(i).padStart(3, '0')}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        brand: brands[Math.floor(Math.random() * brands.length)],
        price: {
          wholesale: Math.floor(Math.random() * 500) + 50,
          retail: Math.floor(Math.random() * 800) + 100,
          currency: 'TRY',
        },
        stock: {
          quantity: Math.floor(Math.random() * 1000) + 10,
          minStockLevel: 10,
          unit: 'adet',
        },
        dimensions: {
          weight: Math.random() * 5 + 0.1,
          length: Math.random() * 50 + 5,
          width: Math.random() * 50 + 5,
          height: Math.random() * 50 + 5,
        },
        images: [`https://picsum.photos/400/400?random=${i}`],
        status: Math.random() > 0.1 ? 'active' : 'inactive',
        tags: [`tag${i}`, 'b2b', 'toptan'],
        supplier: {
          name: `Tedarikçi ${Math.floor(Math.random() * 10) + 1}`,
          contact: `+90 555 ${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
          email: `supplier${Math.floor(Math.random() * 10) + 1}@example.com`,
        },
        isB2BOnly: true,
        minimumOrderQuantity: Math.floor(Math.random() * 10) + 1,
      });
    }

    const createdProducts = await Product.create(products);
    console.log('✅ Ürünler oluşturuldu');

    // Siparişler oluştur
    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const paymentStatuses = ['pending', 'paid', 'failed'];
    const paymentMethods = ['Kredi Kartı', 'Havale', 'Çek', 'Vadeli'];

    const orders = [];
    for (let i = 1; i <= 30; i++) {
      const orderItems = [];
      const itemCount = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < itemCount; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const unitPrice = product.price.wholesale;
        
        orderItems.push({
          product: product._id,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
          sku: product.sku,
          name: product.name,
        });
      }

      const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * 0.18; // %18 KDV
      const shippingCost = Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : 0;
      const totalAmount = subtotal + taxAmount + shippingCost;

      orders.push({
        orderNumber: `ORD${String(i).padStart(6, '0')}`,
        customer: {
          name: `Müşteri Firma ${i}`,
          email: `musteri${i}@example.com`,
          phone: `+90 555 ${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
          company: `${i}. Ticaret Ltd. Şti.`,
          taxNumber: String(Math.floor(Math.random() * 9000000000) + 1000000000),
          billingAddress: {
            street: `${i}. Sokak No: ${Math.floor(Math.random() * 100) + 1}`,
            city: 'İstanbul',
            state: 'Marmara',
            postalCode: String(Math.floor(Math.random() * 90000) + 10000),
            country: 'Türkiye',
          },
          shippingAddress: {
            street: `${i}. Sokak No: ${Math.floor(Math.random() * 100) + 1}`,
            city: 'İstanbul',
            state: 'Marmara',
            postalCode: String(Math.floor(Math.random() * 90000) + 10000),
            country: 'Türkiye',
          },
        },
        items: orderItems,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
        currency: 'TRY',
        notes: Math.random() > 0.7 ? `Sipariş ${i} için özel notlar` : undefined,
        estimatedDeliveryDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        createdBy: users[0]._id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    await Order.create(orders);
    console.log('✅ Siparişler oluşturuldu');

    console.log('🎉 Veri ekleme tamamlandı!');
    console.log('Demo hesaplar:');
    console.log('- admin@test.com (şifre: 123456)');
    console.log('- manager@test.com (şifre: 123456)');
    console.log('- employee@test.com (şifre: 123456)');

  } catch (error) {
    console.error('❌ Veri ekleme hatası:', error);
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  seedData();
}

export default seedData; 