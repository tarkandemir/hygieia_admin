'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  UsersIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { NotificationProvider } from '../../contexts/NotificationContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Kullanıcılar', href: '/users', icon: UsersIcon },
  { name: 'Ürünler', href: '/products', icon: CubeIcon },
  { name: 'Kategoriler', href: '/categories', icon: ChartBarIcon },
  { name: 'Siparişler', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Bildirimler', href: '/notifications', icon: BellIcon },
  { name: 'Email Bildirimleri', href: '/notifications/email', icon: EnvelopeIcon },
  { name: 'Email Geçmişi', href: '/notifications/email/history', icon: ClockIcon },
  { name: 'Raporlar', href: '/reports', icon: ChartBarIcon },
  { name: 'Ayarlar', href: '/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  function SidebarContent() {
    return (
      <div className="pro-layout-sidebar flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 pro-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Hygieia</h1>
              <p className="text-xs text-neutral-500">B2B Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`pro-nav-item group ${isActive ? 'active' : ''} pro-hover-lift`}
              >
                <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-neutral-500 group-hover:text-neutral-700'
                }`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {user && (
          <div className="flex-shrink-0 border-t border-neutral-200 p-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-50">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="h-screen flex bg-neutral-50">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full pro-slide-up">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-72">
            <SidebarContent />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Header */}
          <header className="pro-layout-header flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  className="lg:hidden pro-btn-ghost p-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="pro-heading-4">
                    {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                  </h1>
                  <p className="pro-text-muted">Hoş geldin, {user?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notification Dropdown */}
                <NotificationDropdown />
                
                {/* User Menu */}
                {user && (
                  <div className="flex items-center space-x-3">
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="pro-btn-ghost p-2 text-neutral-500 hover:text-red-600 transition-colors"
                  title="Çıkış Yap"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto pro-layout-main">
            <div className="py-8">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="pro-fade-in">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
} 