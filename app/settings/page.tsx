'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  CogIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  EnvelopeIcon,
  KeyIcon,
  ArrowDownTrayIcon,
  BellIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface Settings {
  general: {
    siteName: string;
    siteUrl: string;
    timezone: string;
    currency: string;
    language: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowRegistration: boolean;
    maxLoginAttempts: number;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    stockAlerts: boolean;
    reportNotifications: boolean;
  };
  system: {
    maintenanceMode: boolean;
    debugMode: boolean;
    cacheEnabled: boolean;
    autoBackup: boolean;
    backupFrequency: string;
  };
}

const DEFAULT_SETTINGS: Settings = {
  general: {
    siteName: 'Hygieia Admin Panel',
    siteUrl: 'https://admin.hygieia.com',
    timezone: 'Europe/Istanbul',
    currency: 'TRY',
    language: 'tr'
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Hygieia'
  },
  security: {
    sessionTimeout: 3600,
    passwordMinLength: 8,
    requireTwoFactor: false,
    allowRegistration: false,
    maxLoginAttempts: 5
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    stockAlerts: true,
    reportNotifications: false
  },
  system: {
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    autoBackup: false,
    backupFrequency: 'daily'
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
      } else {
        setMessage({ type: 'error', text: 'Ayarlar kaydedilemedi!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu!' });
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'Genel', icon: CogIcon },
    { id: 'email', name: 'E-posta', icon: EnvelopeIcon },
    { id: 'security', name: 'Güvenlik', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Bildirimler', icon: BellIcon },
    { id: 'system', name: 'Sistem', icon: GlobeAltIcon },
  ];

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
            <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
            <p className="text-gray-600 mt-1">Sistem konfigürasyonu ve tercihleri</p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Ayarları Kaydet
              </>
            )}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left group rounded-md px-3 py-2 flex items-center text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-500'
                        : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.name} Ayarları
                </h2>
              </div>

              <div className="px-6 py-4 space-y-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Site Adı</label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Site URL</label>
                      <input
                        type="url"
                        value={settings.general.siteUrl}
                        onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Zaman Dilimi</label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="Europe/Istanbul">Istanbul (UTC+3)</option>
                          <option value="Europe/London">London (UTC+0)</option>
                          <option value="America/New_York">New York (UTC-5)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
                        <select
                          value={settings.general.currency}
                          onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="TRY">Türk Lirası (₺)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dil</label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Email Settings */}
                {activeTab === 'email' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                        <input
                          type="text"
                          value={settings.email.smtpHost}
                          onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="smtp.gmail.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                        <input
                          type="number"
                          value={settings.email.smtpPort}
                          onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SMTP Kullanıcı Adı</label>
                        <input
                          type="text"
                          value={settings.email.smtpUser}
                          onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">SMTP Şifre</label>
                        <input
                          type="password"
                          value={settings.email.smtpPassword}
                          onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gönderen E-posta</label>
                        <input
                          type="email"
                          value={settings.email.fromEmail}
                          onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="noreply@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gönderen Adı</label>
                        <input
                          type="text"
                          value={settings.email.fromName}
                          onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Oturum Zaman Aşımı (saniye)</label>
                        <input
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Şifre Uzunluğu</label>
                        <input
                          type="number"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maksimum Giriş Denemesi</label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.security.requireTwoFactor}
                          onChange={(e) => handleInputChange('security', 'requireTwoFactor', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          İki Faktörlü Kimlik Doğrulama Gerekli
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.security.allowRegistration}
                          onChange={(e) => handleInputChange('security', 'allowRegistration', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Yeni Kullanıcı Kaydına İzin Ver
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          E-posta Bildirimleri
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderNotifications}
                          onChange={(e) => handleInputChange('notifications', 'orderNotifications', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Sipariş Bildirimleri
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.stockAlerts}
                          onChange={(e) => handleInputChange('notifications', 'stockAlerts', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Stok Uyarıları
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.reportNotifications}
                          onChange={(e) => handleInputChange('notifications', 'reportNotifications', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Rapor Bildirimleri
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Settings */}
                {activeTab === 'system' && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.system.maintenanceMode}
                          onChange={(e) => handleInputChange('system', 'maintenanceMode', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Bakım Modu
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.system.debugMode}
                          onChange={(e) => handleInputChange('system', 'debugMode', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Debug Modu
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.system.cacheEnabled}
                          onChange={(e) => handleInputChange('system', 'cacheEnabled', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Cache Aktif
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.system.autoBackup}
                          onChange={(e) => handleInputChange('system', 'autoBackup', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Otomatik Yedekleme
                        </label>
                      </div>
                    </div>

                    {settings.system.autoBackup && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Yedekleme Sıklığı</label>
                        <select
                          value={settings.system.backupFrequency}
                          onChange={(e) => handleInputChange('system', 'backupFrequency', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="daily">Günlük</option>
                          <option value="weekly">Haftalık</option>
                          <option value="monthly">Aylık</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 