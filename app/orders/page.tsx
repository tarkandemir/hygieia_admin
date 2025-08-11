'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';
  orderDate: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface OrderStats {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalAmount: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  });

  // Advanced Filters and search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Helper functions for advanced filtering
  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    let fromDate = '';
    let toDate = now.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        fromDate = now.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        fromDate = yesterday.toISOString().split('T')[0];
        toDate = fromDate;
        break;
      case 'last7days':
        const last7 = new Date(now);
        last7.setDate(last7.getDate() - 7);
        fromDate = last7.toISOString().split('T')[0];
        break;
      case 'last30days':
        const last30 = new Date(now);
        last30.setDate(last30.getDate() - 30);
        fromDate = last30.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        fromDate = lastMonth.toISOString().split('T')[0];
        toDate = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'custom':
        // Keep existing dates
        return;
      default:
        fromDate = '';
        toDate = '';
    }

    setDateFrom(fromDate);
    setDateTo(toDate);
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handlePaymentStatusToggle = (paymentStatus: string) => {
    setSelectedPaymentStatus(prev => 
      prev.includes(paymentStatus) 
        ? prev.filter(s => s !== paymentStatus)
        : [...prev, paymentStatus]
    );
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedStatus([]);
    setSelectedPaymentStatus([]);
    setDatePreset('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setCustomerSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return search || selectedStatus.length > 0 || selectedPaymentStatus.length > 0 || 
           dateFrom || dateTo || minAmount || maxAmount || customerSearch;
  };

  useEffect(() => {
    fetchOrders();
    fetchCurrentUser();
  }, [search, selectedStatus, selectedPaymentStatus, dateFrom, dateTo, minAmount, maxAmount, customerSearch, currentPage]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (search) params.append('search', search);
      if (selectedStatus.length > 0) params.append('status', selectedStatus.join(','));
      if (selectedPaymentStatus.length > 0) params.append('paymentStatus', selectedPaymentStatus.join(','));
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (minAmount) params.append('minAmount', minAmount);
      if (maxAmount) params.append('maxAmount', maxAmount);
      if (customerSearch) params.append('customerSearch', customerSearch);

      const response = await fetch(`/api/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const handleDeleteOrder = async (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (!confirm(`"${order?.orderNumber}" siparişini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter(order => order._id !== orderId));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'processing':
        return 'İşlemde';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'paid':
        return 'Ödendi';
      case 'failed':
        return 'Başarısız';
      case 'refunded':
        return 'İade Edildi';
      case 'partial':
        return 'Kısmi';
      default:
        return status;
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const canCreateOrder = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const canEditOrder = (orderStatus: string) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'manager' && orderStatus === 'pending') return true;
    return false;
  };
  const canDeleteOrder = (orderStatus: string) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'manager' && (orderStatus === 'pending' || orderStatus === 'cancelled')) return true;
    return false;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            <p className="text-gray-600">B2B siparişlerinizi yönetin</p>
          </div>
          {canCreateOrder && (
            <Link
              href="/orders/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Yeni Sipariş</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tutar</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalAmount)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ShoppingCartIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teslim Edildi</p>
                <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtreler</h3>
            <div className="flex items-center space-x-3">
              {hasActiveFilters() && (
                <button
                  onClick={resetAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Tümünü Temizle</span>
                </button>
              )}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Gelişmiş Filtreler</span>
              </button>
            </div>
          </div>

          {/* Basic Search */}
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Sipariş numarası, müşteri veya açıklama ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-4 space-y-6">
              {/* Date Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tarih Filtreleri</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                  {[
                    { value: '', label: 'Tümü' },
                    { value: 'today', label: 'Bugün' },
                    { value: 'yesterday', label: 'Dün' },
                    { value: 'last7days', label: 'Son 7 Gün' },
                    { value: 'last30days', label: 'Son 30 Gün' },
                    { value: 'thisMonth', label: 'Bu Ay' },
                    { value: 'lastMonth', label: 'Geçen Ay' },
                    { value: 'custom', label: 'Özel Tarih' },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleDatePresetChange(preset.value)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        datePreset === preset.value
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Date Range */}
                {datePreset === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sipariş Durumu</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'pending', label: 'Beklemede' },
                    { value: 'confirmed', label: 'Onaylandı' },
                    { value: 'processing', label: 'İşlemde' },
                    { value: 'shipped', label: 'Kargoda' },
                    { value: 'delivered', label: 'Teslim Edildi' },
                    { value: 'cancelled', label: 'İptal Edildi' },
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusToggle(status.value)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        selectedStatus.includes(status.value)
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Ödeme Durumu</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'pending', label: 'Beklemede' },
                    { value: 'paid', label: 'Ödendi' },
                    { value: 'failed', label: 'Başarısız' },
                    { value: 'refunded', label: 'İade Edildi' },
                    { value: 'partial', label: 'Kısmi' },
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handlePaymentStatusToggle(status.value)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        selectedPaymentStatus.includes(status.value)
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tutar Aralığı</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Minimum Tutar</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Maksimum Tutar</label>
                    <input
                      type="number"
                      placeholder="99999"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Müşteri Bilgileri</label>
                <input
                  type="text"
                  placeholder="Müşteri adı, e-posta veya şirket ara..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Siparişler ({orders.length})
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
                      Sipariş
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.createdBy.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer.email}
                          </div>
                          {order.customer.company && (
                            <div className="text-xs text-gray-400">
                              {order.customer.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/orders/${order._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          {canEditOrder(order.status) && (
                            <Link
                              href={`/orders/${order._id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          )}
                          {canDeleteOrder(order.status) && (
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="text-red-600 hover:text-red-900"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Sayfa {currentPage} / {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 