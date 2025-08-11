import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { hasPermission } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'products', 'read')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Ürün alınamadı' },
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
    
    if (!userRole || !hasPermission(userRole, 'products', 'update')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    const updates = await request.json();

    // Check if SKU is being updated and if it conflicts
    if (updates.sku && updates.sku !== product.sku) {
      const existingProduct = await Product.findOne({ 
        sku: updates.sku,
        _id: { $ne: id }
      });
      if (existingProduct) {
        return NextResponse.json(
          { error: 'Bu SKU kodu zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Parse numeric fields
    if (updates.wholesalePrice) updates.wholesalePrice = parseFloat(updates.wholesalePrice);
    if (updates.retailPrice) updates.retailPrice = parseFloat(updates.retailPrice);
    if (updates.stock) updates.stock = parseInt(updates.stock);
    if (updates.minStock) updates.minStock = parseInt(updates.minStock);
    if (updates.weight) updates.weight = parseFloat(updates.weight);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Ürün güncellenemedi' },
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
    
    if (!userRole || !hasPermission(userRole, 'products', 'delete')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Ürün silinemedi' },
      { status: 500 }
    );
  }
} 