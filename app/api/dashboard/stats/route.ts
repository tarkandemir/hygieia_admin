import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Current date and 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get current period stats
    const currentOrders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get previous period stats for comparison
    const previousOrders = await Order.find({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    // Calculate current period totals
    const totalRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = currentOrders.length;

    // Calculate previous period totals
    const prevRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const prevOrders = previousOrders.length;

    // Calculate percentage changes
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

    // Get unique customers count
    const uniqueCustomers = new Set(currentOrders.map(order => order.customer.email));
    const totalCustomers = uniqueCustomers.size;

    const prevUniqueCustomers = new Set(previousOrders.map(order => order.customer.email));
    const prevCustomers = prevUniqueCustomers.size;
    const customersChange = prevCustomers > 0 ? ((totalCustomers - prevCustomers) / prevCustomers) * 100 : 0;

    // Get products count
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    
    // For products change, we'll use active vs total products ratio
    const productsChange = totalProducts > 0 ? ((activeProducts / totalProducts) * 100) - 100 : 0;

    const stats = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts: activeProducts,
      revenueChange,
      ordersChange,
      customersChange,
      productsChange,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınamadı' },
      { status: 500 }
    );
  }
} 