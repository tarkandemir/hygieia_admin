import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

interface TopProductAggregate {
  _id: string;
  name: string;
  sku: string;
  salesCount: number;
  revenue: number;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Aggregate to find top selling products
    const topProducts: TopProductAggregate[] = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          salesCount: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $sort: { salesCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Add stock information from Product model
    const Product = require('@/models/Product').default;
    const productIds = topProducts.map(p => p._id);
    const products = await Product.find({ _id: { $in: productIds } }).select('stock');
    
    const result = topProducts.map(product => {
      const productDetail = products.find((p: any) => p._id.toString() === product._id.toString());
      return {
        ...product,
        stock: productDetail?.stock?.quantity || 0
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Top products error:', error);
    return NextResponse.json(
      { error: 'En çok satılan ürünler alınamadı' },
      { status: 500 }
    );
  }
} 