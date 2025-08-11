'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { 
  PencilIcon, 
  ArrowLeftIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  TagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchCurrentUser();
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

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'draft':
        return 'Taslak';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price);
  };

  const canEdit = currentUser?.role && ['admin', 'manager'].includes(currentUser.role);

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

  const profitMargin = product.retailPrice && product.wholesalePrice 
    ? ((product.retailPrice - product.wholesalePrice) / product.wholesalePrice * 100).toFixed(1)
    : '0';

  const isLowStock = product.stock <= product.minStock;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/products"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ürün Detayları</h1>
              <p className="text-gray-600">{product.name}</p>
            </div>
          </div>
          {canEdit && (
            <Link
              href={`/products/${product._id}/edit`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2"
            >
              <PencilIcon className="h-5 w-5" />
              <span>Düzenle</span>
            </Link>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CubeIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Ürün Adı</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{product.name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">SKU Kodu</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">{product.sku}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Kategori</dt>
              <dd className="mt-1">
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {product.category}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Durum</dt>
              <dd className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                  {getStatusText(product.status)}
                </span>
              </dd>
            </div>

            {product.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Açıklama</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Fiyat Bilgileri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Toptan Fiyat</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">{formatPrice(product.wholesalePrice)}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Perakende Fiyat</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">{formatPrice(product.retailPrice)}</dd>
            </div>

            <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Kar Marjı:</span>
                <span className="text-lg font-bold text-green-600">%{profitMargin}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Birim kar: {(product.retailPrice - product.wholesalePrice).toFixed(2)} TRY
              </div>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CubeIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Stok Bilgileri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Mevcut Stok</dt>
              <dd className={`mt-1 text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                {product.stock} {product.unit}
                {isLowStock && <span className="ml-2">⚠️</span>}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Minimum Stok</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">{product.minStock} {product.unit}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Birim</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">{product.unit}</dd>
            </div>

            {isLowStock && (
              <div className="md:col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">
                    Uyarı: Mevcut stok minimum stok seviyesinde veya altında!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Images */}
        {product.images && Array.isArray(product.images) && product.images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-6 w-6 text-indigo-600">📷</div>
              <h3 className="text-lg font-semibold text-gray-900">Ürün Resimleri</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`${product.name} - Resim ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-md">
                      Ana Resim
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Physical Properties */}
        {(product.weight || (product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height))) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <ScaleIcon className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Fiziksel Özellikler</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {product.weight && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ağırlık</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.weight} kg</dd>
                </div>
              )}
              
              {product.dimensions?.length && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Uzunluk</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.dimensions.length} cm</dd>
                </div>
              )}
              
              {product.dimensions?.width && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Genişlik</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.dimensions.width} cm</dd>
                </div>
              )}
              
              {product.dimensions?.height && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Yükseklik</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.dimensions.height} cm</dd>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Supplier Information */}
        {(product.supplier?.name || product.supplier?.contact || product.supplier?.email || product.supplier?.phone) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tedarikçi Bilgileri</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.supplier?.name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tedarikçi Adı</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.supplier.name}</dd>
                </div>
              )}
              
              {product.supplier?.contact && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">İletişim Kişisi</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{product.supplier.contact}</dd>
                </div>
              )}
              
              {product.supplier?.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    <a href={`mailto:${product.supplier.email}`} className="text-indigo-600 hover:text-indigo-800">
                      {product.supplier.email}
                    </a>
                  </dd>
                </div>
              )}
              
              {product.supplier?.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    <a href={`tel:${product.supplier.phone}`} className="text-indigo-600 hover:text-indigo-800">
                      {product.supplier.phone}
                    </a>
                  </dd>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TagIcon className="h-6 w-6 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Etiketler</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Kayıt Bilgileri</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(product.createdAt).toLocaleString('tr-TR')}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Son Güncelleme</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(product.updatedAt).toLocaleString('tr-TR')}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 