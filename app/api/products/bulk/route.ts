import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const { action, productIds, status, category } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Ürün ID\'leri gerekli' },
        { status: 400 }
      );
    }

    let updateData = {};
    
    if (action === 'updateStatus') {
      if (!status || !['active', 'inactive', 'draft'].includes(status)) {
        return NextResponse.json(
          { error: 'Geçerli bir durum değeri gerekli (active, inactive, draft)' },
          { status: 400 }
        );
      }
      updateData = { status };
    } else if (action === 'updateCategory') {
      if (!category) {
        return NextResponse.json(
          { error: 'Kategori gerekli' },
          { status: 400 }
        );
      }
      updateData = { category };
    } else {
      return NextResponse.json(
        { error: 'Geçersiz işlem' },
        { status: 400 }
      );
    }

    // Update multiple products
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} ürün güncellendi`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Toplu güncelleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Ürün ID\'leri gerekli' },
        { status: 400 }
      );
    }

    // Delete multiple products
    const result = await Product.deleteMany({
      _id: { $in: productIds }
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} ürün silindi`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Toplu silme işlemi başarısız' },
      { status: 500 }
    );
  }
} 