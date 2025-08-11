import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '6months';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let monthsBack: number;

    switch (range) {
      case '1month':
        monthsBack = 1;
        break;
      case '3months':
        monthsBack = 3;
        break;
      case '6months':
        monthsBack = 6;
        break;
      case '1year':
        monthsBack = 12;
        break;
      default:
        monthsBack = 6;
    }

    startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

    // Aggregate sales data by month
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format the data
    const formattedData = salesData.map((item, index, array) => {
      const monthNames = [
        'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
        'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
      ];
      
      const month = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      
      // Calculate growth from previous month
      let growth = 0;
      if (index > 0) {
        const prevRevenue = array[index - 1].revenue;
        if (prevRevenue > 0) {
          growth = ((item.revenue - prevRevenue) / prevRevenue) * 100;
        }
      }

      return {
        month,
        revenue: item.revenue,
        orders: item.orders,
        growth: Math.round(growth * 10) / 10
      };
    });

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Sales data fetch error:', error);
    return NextResponse.json(
      { error: 'Satış verileri alınamadı' },
      { status: 500 }
    );
  }
} 