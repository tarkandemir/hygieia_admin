'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface User {
  _id?: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  permissions: string[];
}

interface UserFormProps {
  user?: User;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export default function UserForm({ user, isEditing = false, onSuccess }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    name: user?.name || '',
    role: user?.role || 'employee' as const,
    isActive: user?.isActive !== undefined ? user.isActive : true,
    permissions: user?.permissions || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.name) {
      newErrors.name = 'Ad soyad gereklidir';
    }

    if (!formData.role) {
      newErrors.role = 'Rol seçimi gereklidir';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Şifre gereklidir';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/users/${user?._id}` : '/api/users';
      const method = isEditing ? 'PATCH' : 'POST';

      const body: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if it's provided
      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/users');
        }
      } else {
        setErrors({ submit: data.error || 'Bir hata oluştu' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Bağlantı hatası. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'employee', label: 'Çalışan', description: 'Temel erişim yetkileri' },
    { value: 'manager', label: 'Yönetici', description: 'Orta seviye yönetim yetkileri' },
    { value: 'admin', label: 'Admin', description: 'Tam sistem yetkileri' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.submit && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{errors.submit}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
            E-posta Adresi *
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400 text-gray-900 placeholder-gray-500 ${
                errors.email 
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-300'
              }`}
              placeholder="örnek: kullanici@sirket.com"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
            Ad Soyad *
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400 text-gray-900 placeholder-gray-500 ${
                errors.name 
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-300'
              }`}
              placeholder="örnek: Ahmet Yılmaz"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
            Şifre {!isEditing && '*'}
            {isEditing && <span className="text-indigo-600 text-xs ml-2">(Değiştirmek için doldurun)</span>}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 pr-12 bg-white border-2 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400 text-gray-900 placeholder-gray-500 ${
                errors.password 
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-300'
              }`}
              placeholder={isEditing ? "Yeni şifre (isteğe bağlı)" : "En az 6 karakter"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-xl transition-colors"
              title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
            Şifre Tekrarı {!isEditing && '*'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400 text-gray-900 placeholder-gray-500 ${
                errors.confirmPassword 
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                  : 'border-gray-300'
              }`}
              placeholder={isEditing ? "Yeni şifre tekrarı" : "Şifreyi tekrar girin"}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
          Kullanıcı Rolü *
        </label>
        <div className="relative">
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400 text-gray-900 appearance-none cursor-pointer ${
              errors.role 
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                : 'border-gray-300'
            }`}
          >
            <option value="" disabled className="text-gray-500">Rol seçiniz</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-900 py-2">
                {option.label} - {option.description}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.role && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.role}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-800">
              Hesap Durumu
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Kullanıcının sisteme giriş yapıp yapamayacağını belirler
            </p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                formData.isActive ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`ml-3 text-sm font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.isActive ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kaydediliyor...
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditing ? 'Güncelle' : 'Kullanıcı Oluştur'}
            </div>
          )}
        </button>
      </div>
    </form>
  );
} 