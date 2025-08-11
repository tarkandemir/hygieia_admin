'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  CalendarDaysIcon,
  UsersIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface EmailHistory {
  id: string;
  subject: string;
  recipients: string[];
  status: 'sent' | 'failed' | 'scheduled' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentAt?: string;
  scheduledAt?: string;
  templateId?: string;
  templateName?: string;
  senderName: string;
  successCount: number;
  failedCount: number;
  totalCount: number;
}

export default function EmailHistoryPage() {
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<EmailHistory | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadEmailHistory();
  }, []);

  const loadEmailHistory = async () => {
    setLoading(true);
    try {
      // In real implementation, this would fetch from API
      // For now, we'll simulate with sample data
      const sampleHistory: EmailHistory[] = [
        {
          id: '1',
          subject: 'Hygieia B2B Platformuna Hoş Geldiniz!',
          recipients: ['john@company.com', 'jane@company.com'],
          status: 'sent',
          priority: 'medium',
          sentAt: '2024-01-10T10:30:00Z',
          templateId: 'welcome',
          templateName: 'Hoş Geldin Mesajı',
          senderName: 'Admin User',
          successCount: 2,
          failedCount: 0,
          totalCount: 2
        },
        {
          id: '2',
          subject: 'Sipariş Durumu Güncellendi - SP2024010001',
          recipients: ['customer@company.com'],
          status: 'sent',
          priority: 'high',
          sentAt: '2024-01-10T14:15:00Z',
          templateId: 'order_update',
          templateName: 'Sipariş Güncellemesi',
          senderName: 'Admin User',
          successCount: 1,
          failedCount: 0,
          totalCount: 1
        },
        {
          id: '3',
          subject: 'Planlı Sistem Bakımı Bildirimi',
          recipients: ['all-users@company.com'],
          status: 'scheduled',
          priority: 'urgent',
          scheduledAt: '2024-01-15T02:00:00Z',
          templateId: 'system_maintenance',
          templateName: 'Sistem Bakımı',
          senderName: 'Admin User',
          successCount: 0,
          failedCount: 0,
          totalCount: 25
        },
        {
          id: '4',
          subject: 'Ürün Katalog Güncellemesi',
          recipients: ['sales@company.com', 'marketing@company.com'],
          status: 'failed',
          priority: 'medium',
          sentAt: '2024-01-09T16:45:00Z',
          senderName: 'Manager User',
          successCount: 1,
          failedCount: 1,
          totalCount: 2
        },
        {
          id: '5',
          subject: 'Haftalık Performans Raporu',
          recipients: ['management@company.com'],
          status: 'pending',
          priority: 'low',
          senderName: 'System',
          successCount: 0,
          failedCount: 0,
          totalCount: 3
        }
      ];

      setEmailHistory(sampleHistory);
    } catch (error) {
      console.error('Error loading email history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter emails based on search and filters
  const filteredEmails = emailHistory.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipients.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || email.status === statusFilter;
    const matchesPriority = !priorityFilter || email.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'sent':
        return (
          <span className={`${baseClass} bg-green-100 text-green-800`}>
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Gönderildi
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClass} bg-red-100 text-red-800`}>
            <XCircleIcon className="w-3 h-3 mr-1" />
            Başarısız
          </span>
        );
      case 'scheduled':
        return (
          <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>
            <ClockIcon className="w-3 h-3 mr-1" />
            Planlandı
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClass} bg-blue-100 text-blue-800`}>
            <ClockIcon className="w-3 h-3 mr-1" />
            Beklemede
          </span>
        );
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const baseClass = "inline-flex px-2 py-1 text-xs font-medium rounded-full";
    
    switch (priority) {
      case 'urgent':
        return <span className={`${baseClass} bg-red-100 text-red-800`}>Acil</span>;
      case 'high':
        return <span className={`${baseClass} bg-orange-100 text-orange-800`}>Yüksek</span>;
      case 'medium':
        return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Orta</span>;
      case 'low':
        return <span className={`${baseClass} bg-blue-100 text-blue-800`}>Düşük</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>{priority}</span>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // View email details
  const viewEmailDetails = (email: EmailHistory) => {
    setSelectedEmail(email);
    setShowDetails(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <EnvelopeIcon className="h-8 w-8 text-indigo-600" />
              <span>Email Geçmişi</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Gönderilen ve planlanmış email bildirimlerini görüntüleyin
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ara
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Konu, gönderen veya alıcı ara..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tümü</option>
                <option value="sent">Gönderildi</option>
                <option value="failed">Başarısız</option>
                <option value="scheduled">Planlandı</option>
                <option value="pending">Beklemede</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Öncelik
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tümü</option>
                <option value="urgent">Acil</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email History List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Email Geçmişi ({filteredEmails.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-12 text-center">
              <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email geçmişi bulunamadı
              </h3>
              <p className="text-gray-500">
                Arama kriterlerinizi değiştirmeyi deneyin.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {email.subject}
                        </h4>
                        {getStatusBadge(email.status)}
                        {getPriorityBadge(email.priority)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="h-4 w-4" />
                          <span>{email.totalCount} alıcı</span>
                        </div>
                        
                        {email.templateName && (
                          <div>
                            Şablon: {email.templateName}
                          </div>
                        )}
                        
                        <div>
                          Gönderen: {email.senderName}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {email.sentAt && (
                          <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>Gönderildi: {formatDate(email.sentAt)}</span>
                          </div>
                        )}
                        
                        {email.scheduledAt && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>Planlandı: {formatDate(email.scheduledAt)}</span>
                          </div>
                        )}

                        {email.status === 'sent' && (
                          <div className="text-green-600">
                            ✓ {email.successCount} başarılı
                            {email.failedCount > 0 && (
                              <span className="text-red-600 ml-2">
                                ✗ {email.failedCount} başarısız
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <span>Alıcılar: </span>
                        {email.recipients.slice(0, 3).join(', ')}
                        {email.recipients.length > 3 && (
                          <span className="text-gray-400">
                            {' '}ve {email.recipients.length - 3} kişi daha
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => viewEmailDetails(email)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-indigo-50"
                        title="Detayları görüntüle"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Details Modal */}
        {showDetails && selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Email Detayları
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Konu</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmail.subject}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durum</label>
                    <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Öncelik</label>
                    <div className="mt-1">{getPriorityBadge(selectedEmail.priority)}</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gönderen</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmail.senderName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alıcılar ({selectedEmail.totalCount})
                  </label>
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    {selectedEmail.recipients.map((recipient, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {recipient}
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedEmail.templateName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Şablon</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmail.templateName}</p>
                  </div>
                )}
                
                {selectedEmail.sentAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gönderim Tarihi</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedEmail.sentAt)}</p>
                  </div>
                )}
                
                {selectedEmail.scheduledAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Planlanan Tarih</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedEmail.scheduledAt)}</p>
                  </div>
                )}

                {selectedEmail.status === 'sent' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Başarılı</label>
                      <p className="mt-1 text-sm text-green-600 font-medium">{selectedEmail.successCount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Başarısız</label>
                      <p className="mt-1 text-sm text-red-600 font-medium">{selectedEmail.failedCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 