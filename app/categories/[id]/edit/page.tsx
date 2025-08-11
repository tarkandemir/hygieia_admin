'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import CategoryForm from '@/components/forms/CategoryForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
  updatedAt: string;
}

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Kategori bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            Düzenlemek istediğiniz kategori mevcut değil.
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
        <div className="flex items-center space-x-4">
          <Link
            href={`/categories/${categoryId}`}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: category.color }}
            >
              {category.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name} - Düzenle
              </h1>
              <p className="text-gray-600">Kategori bilgilerini güncelleyin</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CategoryForm category={category} isEditing={true} />
      </div>
    </AdminLayout>
  );
} 