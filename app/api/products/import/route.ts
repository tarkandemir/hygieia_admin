import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { hasPermission } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !hasPermission(userRole, 'products', 'create')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya yüklenemedi' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Dosyada veri bulunamadı' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Skip header row
    const dataLines = lines.slice(1);
    const imported = [];
    const errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const columns = parseCSVLine(dataLines[i]);
        
        if (columns.length < 15) {
          errors.push(`Satır ${i + 2}: Eksik veri`);
          continue;
        }

        const [
          name,
          sku,
          category,
          wholesalePrice,
          retailPrice,
          stock,
          minStock,
          unit,
          weight,
          length,
          width,
          height,
          supplier,
          status,
          description
        ] = columns;

        // Validate required fields
        if (!name || !sku) {
          errors.push(`Satır ${i + 2}: Ürün adı ve SKU gereklidir`);
          continue;
        }

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
        if (existingProduct) {
          errors.push(`Satır ${i + 2}: SKU "${sku}" zaten kullanılıyor`);
          continue;
        }

        // Parse numeric fields
        const parsedWholesalePrice = parseFloat(wholesalePrice) || 0;
        const parsedRetailPrice = parseFloat(retailPrice) || 0;
        const parsedStock = parseInt(stock) || 0;
        const parsedMinStock = parseInt(minStock) || 0;
        const parsedWeight = parseFloat(weight) || undefined;
        const parsedLength = parseFloat(length) || undefined;
        const parsedWidth = parseFloat(width) || undefined;
        const parsedHeight = parseFloat(height) || undefined;

        // Create product object
        const productData = {
          name: name.trim(),
          sku: sku.toUpperCase().trim(),
          category: category.trim() || 'Genel',
          wholesalePrice: parsedWholesalePrice,
          retailPrice: parsedRetailPrice,
          stock: parsedStock,
          minStock: parsedMinStock,
          unit: unit.trim() || 'adet',
          weight: parsedWeight,
          dimensions: {
            length: parsedLength,
            width: parsedWidth,
            height: parsedHeight,
          },
          supplier: {
            name: supplier.trim() || '',
          },
          status: ['active', 'inactive', 'draft'].includes(status) ? status : 'active',
          description: description.trim() || '',
          tags: [],
          images: [],
        };

        const product = new Product(productData);
        await product.save();
        imported.push(product.name);

      } catch (error) {
        errors.push(`Satır ${i + 2}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      }
    }

    const response: any = {
      imported: imported.length,
      total: dataLines.length,
      products: imported,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'İçe aktarma sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV line
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i - 1] === ',')) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
} 