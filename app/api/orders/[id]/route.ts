import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { hasPermission } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'orders', 'read')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findById(id)
      .populate('createdBy', 'name email');

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Sipariş alınamadı' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'orders', 'update')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    const updates = await request.json();

    // Handle stock adjustments if items are being updated
    if (updates.items && Array.isArray(updates.items)) {
      // First, restore stock for current items
      for (const currentItem of order.items) {
        await Product.findByIdAndUpdate(
          currentItem.productId,
          { $inc: { stock: currentItem.quantity } }
        );
      }

      // Validate and process new items
      let subtotal = 0;
      const validatedItems = [];

      for (const item of updates.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return NextResponse.json(
            { error: `Ürün bulunamadı: ${item.productId}` },
            { status: 400 }
          );
        }

        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `${product.name} için yeterli stok yok. Mevcut: ${product.stock}, İstenen: ${item.quantity}` },
            { status: 400 }
          );
        }

        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;

        validatedItems.push({
          productId: item.productId,
          name: product.name,
          sku: product.sku,
          category: product.category || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: itemTotal,
        });
      }

      // Update stock for new items
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
      }

      // Recalculate totals if items changed
      const taxAmount = updates.taxAmount || order.taxAmount;
      const shippingCost = updates.shippingCost || order.shippingCost;
      const discountAmount = updates.discountAmount || order.discountAmount;
      const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

      updates.items = validatedItems;
      updates.subtotal = subtotal;
      updates.totalAmount = totalAmount;
    }

    // Special handling for status changes
    if (updates.status && updates.status !== order.status) {
      // Add timestamp for specific status changes
      if (updates.status === 'shipped') {
        updates.shippedAt = new Date();
      } else if (updates.status === 'delivered') {
        updates.actualDeliveryDate = updates.actualDeliveryDate || new Date();
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email');

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Sipariş güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'orders', 'delete')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    // Check if order can be deleted (only pending orders)
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Sadece beklemede olan veya iptal edilmiş siparişler silinebilir' },
        { status: 400 }
      );
    }

    // Restore stock if order is not cancelled
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Sipariş başarıyla silindi' });
  } catch (error) {
    console.error('Order deletion error:', error);
    return NextResponse.json(
      { error: 'Sipariş silinemedi' },
      { status: 500 }
    );
  }
} 