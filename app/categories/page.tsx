'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  SwatchIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
    fetchCurrentUser();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    if (!confirm(`"${category?.name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories(); // Refresh the list
        alert('Kategori başarıyla silindi');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Kategori silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategori silinirken hata oluştu');
    }
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        await fetchCategories(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  const canCreateCategory = currentUser?.role && ['admin', 'manager'].includes(currentUser.role);
  const canEditCategory = currentUser?.role && ['admin', 'manager'].includes(currentUser.role);
  const canDeleteCategory = currentUser?.role === 'admin';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h1>
            <p className="text-gray-600">Ürün kategorilerini yönetin</p>
          </div>
          {canCreateCategory && (
            <Link
              href="/categories/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Yeni Kategori</span>
            </Link>
          )}
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Kategoriler ({categories.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="ml-2 text-sm text-gray-600 font-mono">
                            {category.color}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {category.order}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            category.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {category.isActive ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/categories/${category._id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                            title="Görüntüle"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          {canEditCategory && (
                            <Link
                              href={`/categories/${category._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                              title="Düzenle"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          )}
                          {canDeleteCategory && (
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              title="Sil"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className="text-center py-12">
              <SwatchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kategori yok</h3>
              <p className="text-gray-500 mb-4">
                Ürünlerinizi organize etmek için kategoriler oluşturun.
              </p>
              {canCreateCategory && (
                <Link
                  href="/categories/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  İlk kategoriyi oluşturun
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 