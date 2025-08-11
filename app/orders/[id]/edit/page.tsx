'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import OrderForm from '@/components/forms/OrderForm';
import Link from 'next/link';
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    taxId?: string;
  };
  billingAddress: {
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  shippingAddress: {
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  internalNotes?: string;
  orderDate: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

export default function EditOrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            Düzenlemek istediğiniz sipariş mevcut değil veya erişim yetkiniz yok.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            Sipariş listesine dön
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
            href={`/orders/${order._id}`}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sipariş Düzenle</h1>
            <p className="text-gray-600">#{order.orderNumber}</p>
          </div>
        </div>

        {/* Order Form */}
        <OrderForm order={order} isEditing={true} />
      </div>
    </AdminLayout>
  );
} 