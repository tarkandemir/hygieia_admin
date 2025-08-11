'use client';

import { useEffect, useState } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Ciro',
      value: stats ? `₺${stats.totalRevenue.toLocaleString('tr-TR')}` : '₺0',
      change: stats?.revenueChange || 0,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Toplam Sipariş',
      value: stats ? stats.totalOrders.toLocaleString('tr-TR') : '0',
      change: stats?.ordersChange || 0,
      icon: ShoppingBagIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Müşteri Sayısı',
      value: stats ? stats.totalCustomers.toLocaleString('tr-TR') : '0',
      change: stats?.customersChange || 0,
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Ürün Sayısı',
      value: stats ? stats.totalProducts.toLocaleString('tr-TR') : '0',
      change: stats?.productsChange || 0,
      icon: CubeIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm font-medium ${
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">son 30 günde</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 