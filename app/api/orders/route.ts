import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'orders', 'read')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // URL search params for advanced filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // Comma-separated values
    const paymentStatus = searchParams.get('paymentStatus'); // Comma-separated values
    const customerEmail = searchParams.get('customerEmail');
    const customerSearch = searchParams.get('customerSearch');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    // Basic search across multiple fields
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.company': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Multiple status filter
    if (status) {
      const statusArray = status.split(',').filter(s => s.trim());
      if (statusArray.length > 0) {
        filter.status = { $in: statusArray };
      }
    }
    
    // Multiple payment status filter
    if (paymentStatus) {
      const paymentStatusArray = paymentStatus.split(',').filter(s => s.trim());
      if (paymentStatusArray.length > 0) {
        filter.paymentStatus = { $in: paymentStatusArray };
      }
    }

    // Customer email exact match (legacy support)
    if (customerEmail) {
      filter['customer.email'] = customerEmail;
    }

    // Customer search (name, email, company)
    if (customerSearch) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { 'customer.name': { $regex: customerSearch, $options: 'i' } },
          { 'customer.email': { $regex: customerSearch, $options: 'i' } },
          { 'customer.company': { $regex: customerSearch, $options: 'i' } }
        ]
      });
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.orderDate = {};
      if (dateFrom) {
        filter.orderDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Include the entire day by setting time to end of day
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        filter.orderDate.$lte = endOfDay;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount && !isNaN(parseFloat(minAmount))) {
        filter.totalAmount.$gte = parseFloat(minAmount);
      }
      if (maxAmount && !isNaN(parseFloat(maxAmount))) {
        filter.totalAmount.$lte = parseFloat(maxAmount);
      }
    }

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    // Fetch orders with filters and populate
    const orders = await Order.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate statistics based on current filters
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    const statsData = stats[0] || {
      totalOrders: 0,
      totalAmount: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0
    };

    return NextResponse.json({
      orders,
      stats: statsData,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: totalPages
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Siparişler alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'orders', 'create')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const orderData = await request.json();
    const userId = request.headers.get('x-user-id');

    // Validate required fields
    if (!orderData.customer || !orderData.billingAddress || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // Validate and prepare order items
    const validatedItems = [];
    let totalAmount = 0;

    for (const item of orderData.items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Geçersiz ürün bilgisi' },
          { status: 400 }
        );
      }

      // Get product details and check stock
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Ürün bulunamadı: ${item.productId}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Yetersiz stok: ${product.name} (Mevcut: ${product.stock}, İstenen: ${item.quantity})` },
          { status: 400 }
        );
      }

      const unitPrice = item.unitPrice || product.wholesalePrice;
      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: item.productId,
        name: product.name,
        sku: product.sku,
        category: product.category || '',
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
      });

      // Update product stock
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Create order
    const order = new Order({
      customer: orderData.customer,
      billingAddress: orderData.billingAddress,
      shippingAddress: orderData.shippingAddress || orderData.billingAddress,
      items: validatedItems,
      subtotalAmount: totalAmount,
      shippingAmount: orderData.shippingAmount || 0,
      taxAmount: orderData.taxAmount || 0,
      totalAmount: totalAmount + (orderData.shippingAmount || 0) + (orderData.taxAmount || 0),
      status: orderData.status || 'pending',
      paymentStatus: orderData.paymentStatus || 'pending',
      paymentMethod: orderData.paymentMethod || 'bank_transfer',
      orderDate: orderData.orderDate || new Date(),
      estimatedDeliveryDate: orderData.estimatedDeliveryDate,
      notes: orderData.notes || '',
      createdBy: userId
    });

    await order.save();

    // Populate the created order
    const populatedOrder = await Order.findById(order._id)
      .populate('createdBy', 'name email');

    return NextResponse.json(populatedOrder, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Sipariş oluşturulamadı' },
      { status: 500 }
    );
  }
} 