'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import CategoryForm from '@/components/forms/CategoryForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NewCategoryPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            href="/categories"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Kategori</h1>
            <p className="text-gray-600">Yeni bir ürün kategorisi oluşturun</p>
          </div>
        </div>

        {/* Form */}
        <CategoryForm />
      </div>
    </AdminLayout>
  );
} 