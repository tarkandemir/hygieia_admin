'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  EnvelopeIcon,
  UserIcon,
  UsersIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'order' | 'system' | 'custom';
}

export default function EmailNotificationsPage() {
  // Form states
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState<'single' | 'multiple' | 'all'>('single');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [sendType, setSendType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Load users and templates
  useEffect(() => {
    fetchUsers();
    loadTemplates();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        // API directly returns users array, not { users: users }
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

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/email/send');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        console.error('Error loading templates:', response.statusText);
        // Fallback to empty array
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  };

  // Template selection handler
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };

  // User selection handlers
  const handleUserSelect = (user: User) => {
    if (selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const selectAllUsers = () => {
    const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
    setSelectedUsers(filteredUsers);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Get filtered users for search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Email preview
  const getEmailPreview = () => {
    // Simple variable replacement for preview
    let previewSubject = emailSubject;
    let previewBody = emailBody;
    
    const sampleUser = selectedUsers[0] || { name: 'Örnek Kullanıcı', email: 'ornek@email.com', role: 'employee' };
    
    previewSubject = previewSubject.replace(/\{\{name\}\}/g, sampleUser.name);
    previewSubject = previewSubject.replace(/\{\{email\}\}/g, sampleUser.email);
    previewSubject = previewSubject.replace(/\{\{role\}\}/g, sampleUser.role);
    
    previewBody = previewBody.replace(/\{\{name\}\}/g, sampleUser.name);
    previewBody = previewBody.replace(/\{\{email\}\}/g, sampleUser.email);
    previewBody = previewBody.replace(/\{\{role\}\}/g, sampleUser.role);
    previewBody = previewBody.replace(/\{\{orderNumber\}\}/g, 'SP2024010001');
    previewBody = previewBody.replace(/\{\{orderStatus\}\}/g, 'Hazırlanıyor');
    previewBody = previewBody.replace(/\{\{updateDate\}\}/g, new Date().toLocaleDateString('tr-TR'));
    
    return { subject: previewSubject, body: previewBody };
  };

  // Send email handler
  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || selectedUsers.length === 0) {
      alert('Lütfen tüm gerekli alanları doldurun ve en az bir alıcı seçin.');
      return;
    }

    setLoading(true);
    try {
      const emailData = {
        recipients: selectedUsers.map(u => u.email),
        subject: emailSubject,
        body: emailBody,
        priority,
        sendType,
        scheduledDate: sendType === 'scheduled' ? scheduledDate : null,
        templateId: selectedTemplate
      };

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Email gönderim hatası');
      }

      const result = await response.json();
      
      // Show detailed success message
      const { summary } = result;
      let message = '';
      
      if (sendType === 'immediate') {
        message = `Email gönderim tamamlandı!\n\n`;
        message += `✅ Başarılı: ${summary.successful}\n`;
        if (summary.failed > 0) {
          message += `❌ Başarısız: ${summary.failed}\n`;
        }
        message += `📊 Toplam: ${summary.total}`;
      } else {
        message = `Email planlaması tamamlandı!\n\n`;
        message += `📅 Planlanan: ${summary.scheduled}\n`;
        message += `📊 Toplam: ${summary.total}`;
      }
      
      alert(message);
      
      // Reset form
      setSelectedUsers([]);
      setEmailSubject('');
      setEmailBody('');
      setSelectedTemplate('');
      
    } catch (error) {
      console.error('Email send error:', error);
      alert(error instanceof Error ? error.message : 'Email gönderiminde hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <EnvelopeIcon className="h-8 w-8 text-indigo-600" />
              <span>Email Bildirimleri</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Kullanıcılara email bildirimleri gönderin ve yönetin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Email Compose */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Templates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                <span>Email Şablonları</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                      selectedTemplate === template.id 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.subject}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email İçeriği</h3>
              
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konu *
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Email konusu..."
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesaj *
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={12}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Email mesajınızı yazın... ({{name}}, {{email}}, {{role}} gibi değişkenler kullanabilirsiniz)"
                  />
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Öncelik
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gönderim Türü
                    </label>
                    <select
                      value={sendType}
                      onChange={(e) => setSendType(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="immediate">Hemen Gönder</option>
                      <option value="scheduled">Planla</option>
                    </select>
                  </div>
                </div>

                {/* Scheduled Date */}
                {sendType === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gönderim Tarihi
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>Önizleme</span>
                  </button>

                  <button
                    onClick={handleSendEmail}
                    disabled={loading || selectedUsers.length === 0 || !emailSubject.trim() || !emailBody.trim()}
                    className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Gönderiliyor...' : `Gönder (${selectedUsers.length})`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Email Preview */}
            {showPreview && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Önizlemesi</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="border-b border-gray-300 pb-3 mb-3">
                    <div className="text-sm text-gray-600">Konu:</div>
                    <div className="font-medium">{getEmailPreview().subject}</div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{getEmailPreview().body}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Recipients */}
          <div className="space-y-6">
            {/* Recipients Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <UsersIcon className="h-5 w-5 text-gray-500" />
                <span>Alıcılar ({selectedUsers.length})</span>
              </h3>

              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Kullanıcı ara..."
                />
              </div>

              {/* Bulk Actions */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={selectAllUsers}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Tümünü Seç
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Temizle
                </button>
              </div>

              {/* Selected Users Summary */}
              {selectedUsers.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
                  <div className="text-sm font-medium text-indigo-900">
                    {selectedUsers.length} kullanıcı seçildi
                  </div>
                  <div className="text-xs text-indigo-700 mt-1">
                    {selectedUsers.slice(0, 3).map(u => u.name).join(', ')}
                    {selectedUsers.length > 3 && ` ve ${selectedUsers.length - 3} kişi daha`}
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.find(u => u._id === user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 border-2 rounded ${
                          isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <div className="text-sm">Kullanıcı bulunamadı</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 