'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UserDetailPage() {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Yönetici';
      case 'employee':
        return 'Çalışan';
      default:
        return role;
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/users"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Detayları</h1>
              <p className="text-gray-600">{user.name}</p>
            </div>
          </div>
          <Link
            href={`/users/${user._id}/edit`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2"
          >
            <PencilIcon className="h-5 w-5" />
            <span>Düzenle</span>
          </Link>
        </div>

        {/* User Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Kullanıcı Bilgileri</h3>
          </div>
          
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Ad Soyad</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Durum</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Kayıt Tarihi</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleString('tr-TR')}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Son Güncelleme</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.updatedAt).toLocaleString('tr-TR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Permissions */}
        {user.permissions && user.permissions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Yetkiler</h3>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 