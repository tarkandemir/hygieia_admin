import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
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

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { error: 'Kategori alınamadı' },
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

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    const updates = await request.json();

    // Check if name is being updated and if it conflicts
    if (updates.name && updates.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp('^' + updates.name.trim() + '$', 'i') },
        _id: { $ne: id }
      });
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Bu kategori adı zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { error: 'Kategori güncellenemedi' },
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

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    // Check if category is being used by any products
    const Product = (await import('@/models/Product')).default;
    const productsUsingCategory = await Product.countDocuments({ category: category.name });
    
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        { error: `Bu kategori ${productsUsingCategory} ürün tarafından kullanılıyor. Önce bu ürünlerin kategorilerini değiştirin.` },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json(
      { error: 'Kategori silinemedi' },
      { status: 500 }
    );
  }
} 