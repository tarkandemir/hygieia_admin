import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Product from '../../../../models/Product';
import Order from '../../../../models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get current month and previous month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Aggregate current month data
    const currentMonthOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonthStart },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Aggregate previous month data
    const previousMonthOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: previousMonthStart,
            $lte: previousMonthEnd
          },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Get all-time totals
    const allTimeOrdersData = await Order.aggregate([
      {
        $match: { status: { $ne: 'cancelled' } }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalUsers = await User.countDocuments({ isActive: true });
    const totalProducts = await Product.countDocuments({ status: 'active' });

    // Calculate growth percentages
    const currentMonth = currentMonthOrders[0] || { totalRevenue: 0, totalOrders: 0 };
    const previousMonth = previousMonthOrders[0] || { totalRevenue: 0, totalOrders: 0 };
    
    const monthlyGrowth = previousMonth.totalRevenue > 0 
      ? ((currentMonth.totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue * 100)
      : 0;
    
    const orderGrowth = previousMonth.totalOrders > 0
      ? ((currentMonth.totalOrders - previousMonth.totalOrders) / previousMonth.totalOrders * 100)
      : 0;

    const allTimeData = allTimeOrdersData[0] || { totalOrders: 0, totalRevenue: 0 };

    return NextResponse.json({
      totalRevenue: allTimeData.totalRevenue,
      totalOrders: allTimeData.totalOrders,
      totalUsers,
      totalProducts,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınamadı' },
      { status: 500 }
    );
  }
} 