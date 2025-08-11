import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customer totalAmount status createdAt');

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Recent orders error:', error);
    return NextResponse.json(
      { error: 'Son siparişler alınamadı' },
      { status: 500 }
    );
  }
} 