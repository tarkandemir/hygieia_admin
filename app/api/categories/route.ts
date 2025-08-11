import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import { hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'products', 'read')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Kategoriler alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'products', 'create')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { name, description, icon, color, isActive } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Kategori adı gereklidir' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if category name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp('^' + name.trim() + '$', 'i') }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu kategori adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Get next order number
    const lastCategory = await Category.findOne().sort({ order: -1 });
    const nextOrder = (lastCategory?.order || 0) + 1;

    const category = new Category({
      name: name.trim(),
      description: description?.trim() || '',
      icon: icon || 'cube',
      color: color || '#6366f1',
      order: nextOrder,
      isActive: isActive !== undefined ? isActive : true,
    });

    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Kategori oluşturulamadı' },
      { status: 500 }
    );
  }
} 