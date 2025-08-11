import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: 1 });

    // Group orders by date
    const salesByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date: new Date(date).toLocaleDateString('tr-TR', { 
            month: 'short', 
            day: 'numeric' 
          }),
          revenue: 0,
          orders: 0,
        };
      }
      
      acc[date].revenue += order.totalAmount;
      acc[date].orders += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and fill missing dates
    const salesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      if (salesByDate[dateKey]) {
        salesData.push(salesByDate[dateKey]);
      } else {
        salesData.push({
          date: date.toLocaleDateString('tr-TR', { 
            month: 'short', 
            day: 'numeric' 
          }),
          revenue: 0,
          orders: 0,
        });
      }
    }

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Sales data error:', error);
    return NextResponse.json(
      { error: 'Satış verileri alınamadı' },
      { status: 500 }
    );
  }
} 