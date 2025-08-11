'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import OrderForm from '@/components/forms/OrderForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewOrderPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            href="/orders"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Sipariş Oluştur</h1>
            <p className="text-gray-600">B2B sipariş bilgilerini girin</p>
          </div>
        </div>

        {/* Order Form */}
        <OrderForm />
      </div>
    </AdminLayout>
  );
} 