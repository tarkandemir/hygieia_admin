'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TopProduct {
  _id: string;
  name: string;
  sku: string;
  salesCount: number;
  revenue: number;
  stock: number;
}

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const response = await fetch('/api/dashboard/top-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">En Çok Satılan Ürünler</h3>
        <Link
          href="/products"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Tümünü Gör
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product._id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">
                  #{index + 1}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </p>
              <p className="text-xs text-gray-500">
                SKU: {product.sku}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {product.salesCount} satış
              </p>
              <p className="text-xs text-gray-500">
                ₺{product.revenue.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Henüz satış verisi bulunmuyor.</p>
        </div>
      )}
    </div>
  );
} 