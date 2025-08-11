'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import UserForm from '@/components/forms/UserForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  permissions: string[];
}

export default function EditUserPage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setError('Kullanıcı bulunamadı');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Kullanıcı yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <Link
              href="/users"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Kullanıcı Listesine Dön
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href={`/users/${user._id}`}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Düzenle</h1>
            <p className="text-gray-600">{user.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <UserForm user={user} isEditing={true} />
        </div>
      </div>
    </AdminLayout>
  );
} 