'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  EyeIcon,
} from '@heroicons/react/24/outline';

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get latest 10 notifications for dropdown
  const displayNotifications = notifications.slice(0, 10);

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    const baseClass = "h-5 w-5 flex-shrink-0";
    
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

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative pro-btn-ghost p-2 pro-hover-lift"
        title="Bildirimler"
      >
        {unreadCount > 0 ? (
          <BellIcon className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6 text-neutral-500" />
        )}
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 pro-scale-in">
          {/* Header */}
          <div className="pro-card-header border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <h3 className="pro-heading-4">Bildirimler</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllAsRead();
                      setIsOpen(false);
                    }}
                    className="pro-btn-ghost text-green-600 hover:text-green-700 text-sm pro-spacing-sm p-1"
                    title="Tümünü okundu işaretle"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Tümü</span>
                  </button>
                )}
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="pro-btn-ghost text-blue-600 hover:text-blue-700 text-sm pro-spacing-sm p-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Tümünü Gör</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4">
                <div className="pro-loading space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="h-5 w-5 pro-loading-skeleton rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 pro-loading-skeleton rounded w-3/4"></div>
                        <div className="h-3 pro-loading-skeleton rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="pro-text-muted">Henüz bildirim yok</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-neutral-50 cursor-pointer transition-all duration-200 ${
                      !notification.isRead 
                        ? 'bg-blue-50/50 border-l-4 border-blue-500' 
                        : 'hover:bg-neutral-50'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm font-semibold leading-tight ${
                              notification.isRead ? 'text-neutral-600' : 'text-neutral-900'
                            }`}>
                              {notification.title}
                            </p>
                            
                            <p className={`text-xs leading-tight line-clamp-2 ${
                              notification.isRead ? 'text-neutral-500' : 'text-neutral-600'
                            }`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-neutral-400">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                              
                              {/* Priority badge */}
                              {notification.priority === 'urgent' && (
                                <span className="inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  Acil
                                </span>
                              )}
                              {notification.priority === 'high' && (
                                <span className="inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                  Yüksek
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                title="Okundu işaretle"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Sil"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="pro-card-footer bg-neutral-50/50 text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block pro-btn-ghost w-full text-blue-600 hover:text-blue-700 py-2"
              >
                Tüm Bildirimleri Görüntüle
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 