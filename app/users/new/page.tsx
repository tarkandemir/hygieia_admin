import AdminLayout from '@/components/layout/AdminLayout';
import UserForm from '@/components/forms/UserForm';

export default function NewUserPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Kullanıcı Ekle</h1>
          <p className="text-gray-600">Sisteme yeni bir kullanıcı ekleyin</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <UserForm />
        </div>
      </div>
    </AdminLayout>
  );
} 