'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
      fetchCurrentUser();
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'processing': return 'Hazırlanıyor';
      case 'shipped': return 'Kargoda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'paid': return 'Ödendi';
      case 'failed': return 'Başarısız';
      case 'refunded': return 'İade Edildi';
      case 'partial': return 'Kısmi';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'Banka Havalesi';
      case 'credit_card': return 'Kredi Kartı';
      case 'cash': return 'Nakit';
      case 'check': return 'Çek';
      case 'other': return 'Diğer';
      default: return method;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditOrder = currentUser?.role && ['admin', 'manager'].includes(currentUser.role);

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
            Aradığınız sipariş mevcut değil veya erişim yetkiniz yok.
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/orders"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sipariş Detayı</h1>
              <p className="text-gray-600">#{order.orderNumber}</p>
            </div>
          </div>
          {canEditOrder && (
            <Link
              href={`/orders/${order._id}/edit`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2"
            >
              <PencilIcon className="h-5 w-5" />
              <span>Düzenle</span>
            </Link>
          )}
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status || 'pending')}`}>
                {getStatusText(order.status || 'pending')}
              </div>
              <p className="text-sm text-gray-500 mt-2">Sipariş Durumu</p>
            </div>
            <div className="text-center">
              <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getPaymentStatusColor(order.paymentStatus || 'pending')}`}>
                {getPaymentStatusText(order.paymentStatus || 'pending')}
              </div>
              <p className="text-sm text-gray-500 mt-2">Ödeme Durumu</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(order.totalAmount || 0)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Toplam Tutar</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {order.items?.length || 0} ürün
              </div>
              <p className="text-sm text-gray-500 mt-2">Sipariş Kalemi</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Müşteri Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">İletişim Bilgileri</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Ad Soyad:</span> {order.customer?.name || 'N/A'}</p>
                <p><span className="font-medium">E-posta:</span> {order.customer?.email || 'N/A'}</p>
                <p><span className="font-medium">Telefon:</span> {order.customer?.phone || 'N/A'}</p>
                {order.customer?.company && (
                  <p><span className="font-medium">Şirket:</span> {order.customer.company}</p>
                )}
                {order.customer?.taxId && (
                  <p><span className="font-medium">Vergi No:</span> {order.customer.taxId}</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sipariş Bilgileri</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Sipariş Tarihi:</span> {order.orderDate ? formatDate(order.orderDate) : 'N/A'}</p>
                <p><span className="font-medium">Oluşturan:</span> {order.createdBy?.name || 'N/A'}</p>
                <p><span className="font-medium">Ödeme Yöntemi:</span> {order.paymentMethod ? getPaymentMethodText(order.paymentMethod) : 'N/A'}</p>
                {order.estimatedDeliveryDate && (
                  <p><span className="font-medium">Tahmini Teslimat:</span> {new Date(order.estimatedDeliveryDate).toLocaleDateString('tr-TR')}</p>
                )}
                {order.actualDeliveryDate && (
                  <p><span className="font-medium">Gerçek Teslimat:</span> {formatDate(order.actualDeliveryDate)}</p>
                )}
                {order.trackingNumber && (
                  <p><span className="font-medium">Kargo Takip No:</span> {order.trackingNumber}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Billing Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HomeIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Fatura Adresi</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.billingAddress?.name || 'N/A'}</p>
              {order.billingAddress?.company && <p>{order.billingAddress.company}</p>}
              <p>{order.billingAddress?.address1 || 'N/A'}</p>
              {order.billingAddress?.address2 && <p>{order.billingAddress.address2}</p>}
              <p>{order.billingAddress?.city || 'N/A'}, {order.billingAddress?.state || 'N/A'} {order.billingAddress?.postalCode || ''}</p>
              <p>{order.billingAddress?.country || 'N/A'}</p>
              {order.billingAddress?.phone && <p>Tel: {order.billingAddress.phone}</p>}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HomeIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Teslimat Adresi</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shippingAddress?.name || 'N/A'}</p>
              {order.shippingAddress?.company && <p>{order.shippingAddress.company}</p>}
              <p>{order.shippingAddress?.address1 || 'N/A'}</p>
              {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'} {order.shippingAddress?.postalCode || ''}</p>
              <p>{order.shippingAddress?.country || 'N/A'}</p>
              {order.shippingAddress?.phone && <p>Tel: {order.shippingAddress.phone}</p>}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <ShoppingCartIcon className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sipariş Ürünleri</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miktar
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Birim Fiyat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                        {item.category && (
                          <div className="text-sm text-gray-500">Kategori: {item.category}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900">{formatPrice(item.unitPrice)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(item.totalPrice)}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Ürün bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sipariş Özeti</h3>
          </div>

          <div className="max-w-md ml-auto">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ara Toplam:</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">KDV:</span>
                  <span className="font-medium">{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Kargo:</span>
                  <span className="font-medium">{formatPrice(order.shippingCost)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">İndirim:</span>
                  <span className="font-medium text-red-600">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Toplam:</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(order.notes || order.internalNotes) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notlar</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {order.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Müşteri Notları</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                </div>
              )}
              {order.internalNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">İç Notlar</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.internalNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <ClockIcon className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sipariş Geçmişi</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Sipariş oluşturuldu</p>
                <p className="text-sm text-gray-500">
                  {order.createdAt ? formatDate(order.createdAt) : 'N/A'} - {order.createdBy?.name || 'N/A'}
                </p>
              </div>
            </div>
            
            {order.updatedAt && order.createdAt && order.updatedAt !== order.createdAt && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Son güncelleme</p>
                  <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            )}

            {order.actualDeliveryDate && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Teslim edildi</p>
                  <p className="text-sm text-gray-500">{formatDate(order.actualDeliveryDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 