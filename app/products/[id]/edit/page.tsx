'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import ProductForm from '@/components/forms/ProductForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  weight?: number;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  };
  supplier: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
  };
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  images: string[];
}

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
      } else {
        setError('Ürün bulunamadı');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Ürün yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Ürün Listesine Dön
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href={`/products/${product._id}`}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ürün Düzenle</h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </div>

        <ProductForm product={product} isEditing={true} />
      </div>
    </AdminLayout>
  );
} 