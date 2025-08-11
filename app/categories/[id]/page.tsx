'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  SwatchIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
      fetchCurrentUser();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setCategory(data);
      } else {
        console.error('Category not found');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
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

  const handleDeleteCategory = async () => {
    if (!confirm(`"${category?.name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/categories';
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Kategori silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategori silinirken hata oluştu');
    }
  };

  const canEditCategory = currentUser?.role && ['admin', 'manager'].includes(currentUser.role);
  const canDeleteCategory = currentUser?.role === 'admin';

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!category) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <SwatchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Kategori bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            Aradığınız kategori mevcut değil veya silinmiş olabilir.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Kategorilere Dön
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/categories"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg font-medium"
                style={{ backgroundColor: category.color }}
              >
                {category.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-gray-600">Kategori detayları</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {canEditCategory && (
              <Link
                href={`/categories/${categoryId}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Düzenle
              </Link>
            )}
            {canDeleteCategory && (
              <button
                onClick={handleDeleteCategory}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Sil
              </button>
            )}
          </div>
        </div>

        {/* Category Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <InformationCircleIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Kategori Adı
                  </label>
                  <p className="text-lg font-medium text-gray-900">{category.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Açıklama
                  </label>
                  <p className="text-gray-900">
                    {category.description || 'Açıklama eklenmemiş'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Sıra Numarası
                    </label>
                    <p className="text-gray-900">{category.order}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Durum
                    </label>
                    <div className="flex items-center">
                      {category.isActive ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-5 w-5 mr-1" />
                          <span className="font-medium">Aktif</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircleIcon className="h-5 w-5 mr-1" />
                          <span className="font-medium">Pasif</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <SwatchIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Görsel Ayarlar</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">
                    Kategori Rengi
                  </label>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <p className="font-mono text-sm text-gray-600">{category.color}</p>
                      <p className="text-sm text-gray-500">Hex renk kodu</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">
                    Kategori Önizlemesi
                  </label>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div
                      className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-medium mr-4"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-lg font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {category.description || 'Kategori açıklaması'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CalendarDaysIcon className="h-6 w-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Tarihler</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Oluşturma Tarihi
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(category.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Son Güncelleme
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(category.updatedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
              
              <div className="space-y-3">
                <Link
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  Bu kategorideki ürünleri görüntüle
                </Link>
                
                {canEditCategory && (
                  <Link
                    href={`/categories/${categoryId}/edit`}
                    className="block w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md border border-indigo-200"
                  >
                    Kategoriyi düzenle
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 