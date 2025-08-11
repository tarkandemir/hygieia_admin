import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Aggregate top products from order items
    const topProducts = await Order.aggregate([
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
          _id: {
            productId: '$items.productId',
            name: '$items.name',
            sku: '$items.sku'
          },
          totalRevenue: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          sku: '$_id.sku',
          revenue: '$totalRevenue',
          orders: '$totalOrders'
        }
      }
    ]);

    return NextResponse.json(topProducts);

  } catch (error) {
    console.error('Top products fetch error:', error);
    return NextResponse.json(
      { error: 'En çok satan ürünler alınamadı' },
      { status: 500 }
    );
  }
} 