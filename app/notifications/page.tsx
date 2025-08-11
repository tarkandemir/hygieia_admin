'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  PlusIcon,
  UsersIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  } = useNotifications();

  // Filter states
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Create notification modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [notificationType, setNotificationType] = useState<string>('info');
  const [notificationPriority, setNotificationPriority] = useState<string>('medium');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationActionUrl, setNotificationActionUrl] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);

  // Fetch notifications with filters
  useEffect(() => {
    const filters: any = {
      page: currentPage,
      limit: 20
    };

    if (selectedType) filters.type = selectedType;
    if (selectedPriority) filters.priority = selectedPriority;
    if (selectedStatus === 'read') filters.isRead = true;
    if (selectedStatus === 'unread') filters.isRead = false;

    fetchNotifications(filters);
  }, [selectedType, selectedPriority, selectedStatus, currentPage, fetchNotifications]);

  // Load users when modal opens
  useEffect(() => {
    if (showCreateModal) {
      fetchUsers();
    }
  }, [showCreateModal]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        if (Array.isArray(users)) {
          setUsers(users.filter((user: User) => user.isActive));
        } else {
          console.error('Unexpected API response format:', users);
          setUsers([]);
        }
      } else {
        console.error('Error fetching users:', response.statusText);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedType('');
    setSelectedPriority('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedType || selectedPriority || selectedStatus;
  };

  // Reset create modal
  const resetCreateModal = () => {
    setSelectedUser('');
    setNotificationType('info');
    setNotificationPriority('medium');
    setNotificationTitle('');
    setNotificationMessage('');
    setNotificationActionUrl('');
    setUserSearchTerm('');
    setCreating(false);
  };

  // Create notification handler
  const handleCreateNotification = async () => {
    if (!selectedUser || !notificationTitle.trim() || !notificationMessage.trim()) {
      alert('Lütfen kullanıcı seçin ve başlık ile mesaj alanlarını doldurun.');
      return;
    }

    setCreating(true);
    try {
      await createNotification({
        userId: selectedUser,
        type: notificationType,
        priority: notificationPriority,
        title: notificationTitle,
        message: notificationMessage,
        actionUrl: notificationActionUrl || undefined,
      });

      alert('Bildirim başarıyla oluşturuldu!');
      setShowCreateModal(false);
      resetCreateModal();
      
      fetchNotifications({ page: currentPage, limit: 20 });
      
    } catch (error) {
      console.error('Create notification error:', error);
      alert('Bildirim oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setCreating(false);
    }
  };

  // Get filtered users for search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    const baseClass = "h-6 w-6 flex-shrink-0";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${baseClass} text-green-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${baseClass} text-yellow-500`} />;
      case 'error':
        return <XCircleIcon className={`${baseClass} text-red-500`} />;
      case 'system':
        return <Cog6ToothIcon className={`${baseClass} text-blue-500`} />;
      default:
        return <InformationCircleIcon className={`${baseClass} text-blue-500`} />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="pro-badge-danger">Acil</span>;
      case 'high':
        return <span className="pro-badge-warning">Yüksek</span>;
      case 'medium':
        return <span className="pro-badge-primary">Orta</span>;
      case 'low':
        return <span className="pro-badge-neutral">Düşük</span>;
      default:
        return <span className="pro-badge-neutral">{priority}</span>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="pro-heading-2">Bildirimler</h1>
            <p className="pro-text-muted mt-2">
              Sistem bildirimlerinizi yönetin • {unreadCount} okunmamış bildirim
            </p>
          </div>
          
          <div className="flex items-center pro-spacing-md">
            <button
              onClick={() => setShowCreateModal(true)}
              className="pro-btn-primary pro-spacing-sm"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Yeni Bildirim</span>
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="pro-btn-success pro-spacing-sm"
              >
                <CheckIcon className="h-5 w-5" />
                <span>Tümünü Okundu İşaretle</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Card */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div className="flex items-center justify-between">
              <h3 className="pro-heading-4 flex items-center pro-spacing-sm">
                <AdjustmentsHorizontalIcon className="pro-icon" />
                Filtreler
              </h3>
              <div className="flex items-center pro-spacing-md">
                {hasActiveFilters() && (
                  <button
                    onClick={resetFilters}
                    className="pro-btn-ghost text-red-600 hover:text-red-700 pro-spacing-sm"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Temizle</span>
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="pro-btn-secondary pro-spacing-sm"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span>{showFilters ? 'Gizle' : 'Göster'}</span>
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="pro-card-body border-t border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="pro-label">Durum</label>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="pro-select">
                    <option value="">Tümü</option>
                    <option value="unread">Okunmamış</option>
                    <option value="read">Okunmuş</option>
                  </select>
                </div>

                <div>
                  <label className="pro-label">Tür</label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="pro-select">
                    <option value="">Tümü</option>
                    <option value="info">Bilgi</option>
                    <option value="success">Başarı</option>
                    <option value="warning">Uyarı</option>
                    <option value="error">Hata</option>
                    <option value="system">Sistem</option>
                  </select>
                </div>

                <div>
                  <label className="pro-label">Öncelik</label>
                  <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="pro-select">
                    <option value="">Tümü</option>
                    <option value="urgent">Acil</option>
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="pro-alert-error pro-fade-in">
            <div className="flex items-start space-x-3">
              <XCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Hata Oluştu</h3>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="pro-card">
          <div className="pro-card-header">
            <h3 className="pro-heading-4">
              Bildirimler ({notifications.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="pro-card-body">
              <div className="pro-loading space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 pro-loading-skeleton"></div>
                ))}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="pro-card-body text-center py-12">
              <BellIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="pro-heading-4 text-neutral-500 mb-2">
                {hasActiveFilters() ? 'Filtre kriterlerinize uygun bildirim bulunamadı' : 'Henüz bildirim yok'}
              </h3>
              <p className="pro-text-muted">
                {hasActiveFilters() 
                  ? 'Farklı filtre seçeneklerini deneyebilirsiniz.'
                  : 'Yeni bildirimler burada görünecek.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-neutral-50 cursor-pointer transition-all duration-200 pro-hover-lift ${
                    !notification.isRead ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3">
                            <h4 className={`pro-heading-4 ${
                              notification.isRead ? 'text-neutral-600' : 'text-neutral-900'
                            }`}>
                              {notification.title}
                            </h4>
                            {getPriorityBadge(notification.priority)}
                          </div>
                          
                          <p className={`pro-text-body ${
                            notification.isRead ? 'text-neutral-500' : 'text-neutral-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 pro-text-xs">
                            <span>{formatDate(notification.createdAt)}</span>
                            {notification.isRead && notification.readAt && (
                              <span>• Okundu: {formatDate(notification.readAt)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="pro-btn-ghost p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Okundu olarak işaretle"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="pro-btn-ghost p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Sil"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {notifications.length > 0 && (
            <div className="pro-card-footer">
              <div className="flex items-center justify-between">
                <div className="pro-text-muted">
                  Sayfa {currentPage}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="pro-btn-secondary"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={notifications.length < 20}
                    className="pro-btn-secondary"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Notification Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="pro-card max-w-2xl w-full max-h-[90vh] overflow-y-auto pro-scale-in">
              <div className="pro-card-header">
                <div className="flex items-center justify-between">
                  <h3 className="pro-heading-3">Yeni Bildirim Oluştur</h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateModal();
                    }}
                    className="pro-btn-ghost p-2 text-neutral-500 hover:text-neutral-700"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="pro-card-body space-y-6">
                {/* User Selection */}
                <div>
                  <label className="pro-label">Kullanıcı Seçin *</label>
                  
                  <div className="relative mb-3">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pro-input pl-10"
                      placeholder="Kullanıcı ara..."
                    />
                  </div>

                  <div className="border border-neutral-300 rounded-lg max-h-40 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <label
                        key={user._id}
                        className={`flex items-center p-3 hover:bg-neutral-50 cursor-pointer transition-colors ${
                          selectedUser === user._id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedUser"
                          value={user._id}
                          checked={selectedUser === user._id}
                          onChange={(e) => setSelectedUser(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-semibold text-sm text-neutral-900">{user.name}</div>
                          <div className="text-xs text-neutral-500">{user.email}</div>
                          <div className="text-xs text-neutral-400 capitalize">{user.role}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="pro-label">Tür *</label>
                    <select value={notificationType} onChange={(e) => setNotificationType(e.target.value)} className="pro-select">
                      <option value="info">Bilgi</option>
                      <option value="success">Başarı</option>
                      <option value="warning">Uyarı</option>
                      <option value="error">Hata</option>
                      <option value="system">Sistem</option>
                    </select>
                  </div>

                  <div>
                    <label className="pro-label">Öncelik *</label>
                    <select value={notificationPriority} onChange={(e) => setNotificationPriority(e.target.value)} className="pro-select">
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="pro-label">Başlık *</label>
                  <input
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="pro-input"
                    placeholder="Bildirim başlığı..."
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="pro-label">Mesaj *</label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                    className="pro-textarea"
                    placeholder="Bildirim mesajınızı yazın..."
                    maxLength={1000}
                  />
                </div>

                <div>
                  <label className="pro-label">Action URL (İsteğe bağlı)</label>
                  <input
                    type="url"
                    value={notificationActionUrl}
                    onChange={(e) => setNotificationActionUrl(e.target.value)}
                    className="pro-input"
                    placeholder="https://..."
                  />
                  <p className="pro-text-xs mt-1">
                    Bildirime tıklandığında yönlendirileceği URL
                  </p>
                </div>
              </div>

              <div className="pro-card-footer">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateModal();
                    }}
                    className="pro-btn-secondary"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCreateNotification}
                    disabled={creating || !selectedUser || !notificationTitle.trim() || !notificationMessage.trim()}
                    className="pro-btn-primary pro-spacing-sm"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        <span>Bildirim Oluştur</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 