import AdminLayout from '@/components/layout/AdminLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import TopProducts from '@/components/dashboard/TopProducts';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Son güncelleme: {new Date().toLocaleString('tr-TR')}
          </div>
        </div>

        {/* Stats Overview */}
        <DashboardStats />

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          
          {/* Recent Orders */}
          <RecentOrders />
          
          {/* Top Products */}
          <TopProducts />
        </div>
      </div>
    </AdminLayout>
  );
} 