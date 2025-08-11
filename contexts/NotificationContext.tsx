'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface INotification {
  _id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  isRead: boolean;
  isEmailSent: boolean;
  emailSentAt?: string;
  readAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  createNotification: (notification: CreateNotificationData) => Promise<void>;
  
  // Real-time
  refreshNotifications: () => Promise<void>;
}

interface NotificationFilters {
  type?: string;
  priority?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

interface CreateNotificationData {
  userId: string;
  type?: string;
  priority?: string;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  expiresAt?: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Bildirimler alınamadı');
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error('Bildirim güncellenemedi');
      }

      const updatedNotification = await response.json();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: updatedNotification.readAt }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      console.error('Mark as read error:', err);
      setError(err instanceof Error ? err.message : 'İşlem başarısız');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?action=mark-all-read', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Bildirimler güncellenemedi');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);

    } catch (err) {
      console.error('Mark all as read error:', err);
      setError(err instanceof Error ? err.message : 'İşlem başarısız');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Bildirim silinemedi');
      }

      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

    } catch (err) {
      console.error('Delete notification error:', err);
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız');
    }
  }, [notifications]);

  // Create new notification (admin/manager only)
  const createNotification = useCallback(async (notificationData: CreateNotificationData) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error('Bildirim oluşturulamadı');
      }

      const newNotification = await response.json();
      
      // If creating notification for current user, add to local state
      setNotifications(prev => [newNotification, ...prev]);

    } catch (err) {
      console.error('Create notification error:', err);
      setError(err instanceof Error ? err.message : 'Bildirim oluşturma başarısız');
    }
  }, []);

  // Refresh notifications (for real-time updates)
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications({ limit: 20 }); // Get latest 20 notifications
  }, [fetchNotifications]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    // Initial load
    fetchNotifications({ limit: 20 });

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications, refreshNotifications]);

  // Listen for visibility change to refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 