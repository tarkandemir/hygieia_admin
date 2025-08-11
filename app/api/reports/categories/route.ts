import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Aggregate revenue by category from order items
    const categoryData = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.category',
          totalRevenue: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: '$items.quantity' }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: '', $exists: true }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$_id', 'Diğer'] },
          value: '$totalRevenue',
          orders: '$totalOrders'
        }
      }
    ]);

    // If no data, return default categories
    if (categoryData.length === 0) {
      return NextResponse.json([
        { name: 'Teknoloji', value: 50000, orders: 25 },
        { name: 'Giyim', value: 30000, orders: 40 },
        { name: 'Ev & Yaşam', value: 20000, orders: 15 },
        { name: 'Spor', value: 15000, orders: 10 },
        { name: 'Diğer', value: 10000, orders: 8 }
      ]);
    }

    return NextResponse.json(categoryData);

  } catch (error) {
    console.error('Category data fetch error:', error);
    return NextResponse.json(
      { error: 'Kategori verileri alınamadı' },
      { status: 500 }
    );
  }
} 