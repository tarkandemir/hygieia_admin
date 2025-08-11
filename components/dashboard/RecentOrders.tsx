'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    company: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/dashboard/recent-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'confirmed':
        return 'Onaylandı';
      case 'processing':
        return 'İşleniyor';
      case 'shipped':
        return 'Kargoya Verildi';
      case 'delivered':
        return 'Teslim Edildi';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Son Siparişler</h3>
        <Link
          href="/orders"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Tümünü Gör
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.customer.company} - {order.customer.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                ₺{order.totalAmount.toLocaleString('tr-TR')}
              </p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Henüz sipariş bulunmuyor.</p>
        </div>
      )}
    </div>
  );
} 