'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CubeIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  monthlyGrowth: number;
  orderGrowth: number;
}

interface SalesData {
  month: string;
  revenue: number;
  orders: number;
  growth: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  orders: number;
  sku: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    monthlyGrowth: 0,
    orderGrowth: 0
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [dateRange, setDateRange] = useState('6months');

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data
      const [statsRes, salesRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/reports/stats'),
        fetch(`/api/reports/sales?range=${dateRange}`),
        fetch('/api/reports/top-products'),
        fetch('/api/reports/categories')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesData(salesData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setTopProducts(productsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategoryData(categoriesData.map((item: any, index: number) => ({
          ...item,
          color: COLORS[index % COLORS.length]
        })));
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
            <p className="text-gray-600 mt-1">Satış raporları ve istatistikler</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1month">Son 1 Ay</option>
              <option value="3months">Son 3 Ay</option>
              <option value="6months">Son 6 Ay</option>
              <option value="1year">Son 1 Yıl</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  {stats.monthlyGrowth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stats.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.monthlyGrowth)}% bu ay
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrders)}</p>
                <div className="flex items-center mt-2">
                  {stats.orderGrowth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stats.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.orderGrowth)}% bu ay
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                <p className="text-sm text-gray-500 mt-2">Aktif kullanıcılar</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalProducts)}</p>
                <p className="text-sm text-gray-500 mt-2">Aktif ürünler</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CubeIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Satış Trendi</h3>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                    name === 'revenue' ? 'Gelir' : name === 'orders' ? 'Sipariş' : 'Büyüme'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Gelir" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} name="Sipariş" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Kategori Dağılımı</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">En Çok Satan Ürünler</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış Adedi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Gelir
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={product.sku}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">#{index + 1}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatNumber(product.orders)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 