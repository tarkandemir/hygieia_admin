'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  createdAt: string;
  permissions: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u._id === userId);
    console.log('🗑️ Frontend delete request:', {
      currentUser: currentUser?._id,
      currentUserEmail: currentUser?.email,
      targetUserId: userId,
      targetUserEmail: userToDelete?.email,
      isSameUser: currentUser?._id === userId
    });
    
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        alert('Kullanıcı başarıyla silindi');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Kullanıcı silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Kullanıcı silinirken hata oluştu');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, isActive: !currentStatus }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Bulk Operations Functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedUsers.length === 0) return;
    
    setBulkLoading(true);
    try {
      const response = await fetch('/api/users/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          userIds: selectedUsers,
          isActive
        }),
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUsers([]);
        setShowBulkActions(false);
      } else {
        const errorData = await response.json();
        alert(`İşlem başarısız: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Bulk status update error:', error);
      alert('Toplu durum güncellemesi sırasında hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinizden emin misiniz?`)) {
      setBulkLoading(true);
      try {
        const response = await fetch('/api/users/bulk', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds: selectedUsers
          }),
        });

        if (response.ok) {
          fetchUsers();
          setSelectedUsers([]);
          setShowBulkActions(false);
        } else {
          const errorData = await response.json();
          alert(`İşlem başarısız: ${errorData.error || 'Bilinmeyen hata'}`);
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Toplu silme işlemi sırasında hata oluştu');
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkRoleChange = async (newRole: string) => {
    if (selectedUsers.length === 0) return;
    
    setBulkLoading(true);
    try {
      const response = await fetch('/api/users/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateRole',
          userIds: selectedUsers,
          role: newRole
        }),
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUsers([]);
        setShowBulkActions(false);
      } else {
        const errorData = await response.json();
        alert(`İşlem başarısız: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Bulk role update error:', error);
      alert('Toplu rol güncellemesi sırasında hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  // Update bulk actions visibility when selection changes
  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0);
  }, [selectedUsers]);

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

  const canCreateUser = currentUser?.role === 'admin';
  const canEditUser = (userRole: string) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'manager' && userRole === 'employee') return true;
    return false;
  };
  const canDeleteUser = (userRole: string, userId: string) => {
    if (currentUser?._id === userId) return false; // Can't delete self
    return currentUser?.role === 'admin';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
            <p className="text-gray-600">Sistem kullanıcılarını yönetin</p>
          </div>
          {canCreateUser && (
            <Link
              href="/users/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Yeni Kullanıcı</span>
            </Link>
          )}
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} kullanıcı seçildi
                </span>
                <button
                  onClick={() => {
                    setSelectedUsers([]);
                    setShowBulkActions(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Seçimi Temizle
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleBulkStatusChange(true)}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Aktif Yap
                </button>
                <button
                  onClick={() => handleBulkStatusChange(false)}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  Pasif Yap
                </button>
                
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkRoleChange(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  disabled={bulkLoading}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">Rol Değiştir</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Yönetici</option>
                  <option value="employee">Çalışan</option>
                </select>
                
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {bulkLoading ? 'İşleniyor...' : 'Sil'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Kullanıcılar ({users.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={(e) => handleSelectUser(user._id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/users/${user._id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                            title="Görüntüle"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          {canEditUser(user.role) && (
                            <Link
                              href={`/users/${user._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                              title="Düzenle"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          )}
                          {canDeleteUser(user.role, user._id) && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              title="Sil"
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

          {!loading && users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Henüz kullanıcı bulunmuyor.</p>
              {canCreateUser && (
                <Link
                  href="/users/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  İlk kullanıcıyı ekleyin
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 