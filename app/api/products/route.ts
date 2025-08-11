import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import { hasPermission } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'products', 'read')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await dbConnect();

    // URL search params for advanced filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categories = searchParams.get('categories'); // Comma-separated values
    const statuses = searchParams.get('statuses'); // Comma-separated values
    const minWholesalePrice = searchParams.get('minWholesalePrice');
    const maxWholesalePrice = searchParams.get('maxWholesalePrice');
    const minRetailPrice = searchParams.get('minRetailPrice');
    const maxRetailPrice = searchParams.get('maxRetailPrice');
    const stockFilter = searchParams.get('stockFilter');
    const minStock = searchParams.get('minStock');
    const maxStock = searchParams.get('maxStock');
    const supplierSearch = searchParams.get('supplierSearch');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const all = searchParams.get('all') === 'true'; // For export

    // Build filter object
    const filter: any = {};

    // Basic search across multiple fields
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'supplier.name': { $regex: search, $options: 'i' } },
        { 'supplier.contact': { $regex: search, $options: 'i' } }
      ];
    }

    // Multiple categories filter
    if (categories) {
      const categoryArray = categories.split(',').filter(c => c.trim());
      if (categoryArray.length > 0) {
        filter.category = { $in: categoryArray };
      }
    }

    // Multiple statuses filter
    if (statuses) {
      const statusArray = statuses.split(',').filter(s => s.trim());
      if (statusArray.length > 0) {
        filter.status = { $in: statusArray };
      }
    }

    // Wholesale price range filter
    if (minWholesalePrice || maxWholesalePrice) {
      filter.wholesalePrice = {};
      if (minWholesalePrice && !isNaN(parseFloat(minWholesalePrice))) {
        filter.wholesalePrice.$gte = parseFloat(minWholesalePrice);
      }
      if (maxWholesalePrice && !isNaN(parseFloat(maxWholesalePrice))) {
        filter.wholesalePrice.$lte = parseFloat(maxWholesalePrice);
      }
    }

    // Retail price range filter
    if (minRetailPrice || maxRetailPrice) {
      filter.retailPrice = {};
      if (minRetailPrice && !isNaN(parseFloat(minRetailPrice))) {
        filter.retailPrice.$gte = parseFloat(minRetailPrice);
      }
      if (maxRetailPrice && !isNaN(parseFloat(maxRetailPrice))) {
        filter.retailPrice.$lte = parseFloat(maxRetailPrice);
      }
    }

    // Stock filters
    if (stockFilter) {
      switch (stockFilter) {
        case 'inStock':
          filter.stock = { $gt: 0 };
          break;
        case 'lowStock':
          filter.$expr = { $lte: ['$stock', '$minStock'] };
          break;
        case 'outOfStock':
          filter.stock = { $eq: 0 };
          break;
      }
    }

    // Stock range filter (independent of stockFilter preset)
    if (minStock || maxStock) {
      // If stockFilter is already set, combine with $and
      const stockRangeFilter: any = {};
      if (minStock && !isNaN(parseInt(minStock))) {
        stockRangeFilter.$gte = parseInt(minStock);
      }
      if (maxStock && !isNaN(parseInt(maxStock))) {
        stockRangeFilter.$lte = parseInt(maxStock);
      }
      
      if (Object.keys(stockRangeFilter).length > 0) {
        if (filter.stock) {
          // Combine existing stock filter with range filter
          filter.$and = filter.$and || [];
          filter.$and.push({ stock: filter.stock }, { stock: stockRangeFilter });
          delete filter.stock;
        } else {
          filter.stock = stockRangeFilter;
        }
      }
    }

    // Supplier search
    if (supplierSearch) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { 'supplier.name': { $regex: supplierSearch, $options: 'i' } },
          { 'supplier.contact': { $regex: supplierSearch, $options: 'i' } }
        ]
      });
    }

    // Get unique categories for filter options
    const categoriesAggregation = await Product.distinct('category', { status: { $ne: 'deleted' } });

    if (all) {
      // For export - return all products without pagination
      const products = await Product.find(filter).sort({ createdAt: -1 });
      
      return NextResponse.json({
        products,
        categories: categoriesAggregation
      });
    }

    // Regular paginated response
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Fetch products with filters
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalProducts,
        pages: totalPages
      },
      categories: categoriesAggregation
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Ürünler alınamadı' },
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

    await dbConnect();

    const productData = await request.json();

    // Validate required fields
    if (!productData.name || !productData.sku || !productData.category) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik (isim, SKU, kategori)' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Bu SKU zaten mevcut' },
        { status: 400 }
      );
    }

    // Create new product
    const product = new Product({
      name: productData.name,
      description: productData.description || '',
      sku: productData.sku,
      category: productData.category,
      wholesalePrice: productData.wholesalePrice || 0,
      retailPrice: productData.retailPrice || 0,
      stock: productData.stock || 0,
      minStock: productData.minStock || 0,
      unit: productData.unit || 'adet',
      weight: productData.weight,
      dimensions: productData.dimensions,
      tags: productData.tags || [],
      images: productData.images || [],
      supplier: productData.supplier || {},
      status: productData.status || 'active'
    });

    await product.save();

    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Ürün oluşturulamadı' },
      { status: 500 }
    );
  }
} 