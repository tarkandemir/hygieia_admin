'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SwatchIcon,
  TagIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Category {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

interface CategoryFormProps {
  category?: Category;
  isEditing?: boolean;
}

const ICON_OPTIONS = [
  { value: 'cube', label: '📦 Cube', icon: '📦' },
  { value: 'cpu-chip', label: '💻 Elektronik', icon: '💻' },
  { value: 'sparkles', label: '✨ Giyim & Tekstil', icon: '✨' },
  { value: 'cake', label: '🍰 Gıda & İçecek', icon: '🍰' },
  { value: 'home', label: '🏠 Ev & Bahçe', icon: '🏠' },
  { value: 'truck', label: '🚛 Otomotiv', icon: '🚛' },
  { value: 'trophy', label: '🏆 Spor & Outdoor', icon: '🏆' },
  { value: 'heart', label: '❤️ Sağlık & Güzellik', icon: '❤️' },
  { value: 'book-open', label: '📖 Kitap & Medya', icon: '📖' },
  { value: 'briefcase', label: '💼 Ofis Malzemeleri', icon: '💼' },
  { value: 'cog-6-tooth', label: '⚙️ Makine & Ekipman', icon: '⚙️' },
  { value: 'wrench-screwdriver', label: '🔧 İnşaat & Yapı', icon: '🔧' },
  { value: 'beaker', label: '🧪 Kimya & Laboratuvar', icon: '🧪' },
];

const COLOR_OPTIONS = [
  '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#6b7280',
  '#ef4444', '#8b5cf6', '#059669', '#0891b2', '#dc2626',
  '#ca8a04', '#7c3aed', '#6366f1', '#14b8a6', '#f97316'
];

export default function CategoryForm({ category, isEditing = false }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Category>({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'cube',
    color: category?.color || '#6366f1',
    order: category?.order || 0,
    isActive: category?.isActive !== undefined ? category.isActive : true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
              : type === 'number' ? Number(value) 
              : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kategori adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Kategori adı en az 2 karakter olmalıdır';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Kategori adı en fazla 50 karakter olabilir';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Açıklama en fazla 200 karakter olabilir';
    }

    if (formData.order < 0) {
      newErrors.order = 'Sıra numarası negatif olamaz';
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
      const url = isEditing ? `/api/categories/${category?._id}` : '/api/categories';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          icon: formData.icon,
          color: formData.color,
          order: formData.order,
          isActive: formData.isActive,
        }),
      });

      if (response.ok) {
        router.push('/categories');
        router.refresh();
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          if (errorData.error.includes('kategori adı')) {
            setErrors({ name: errorData.error });
          } else {
            alert(errorData.error);
          }
        } else {
          alert('Bir hata oluştu');
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const selectedIcon = ICON_OPTIONS.find(icon => icon.value === formData.icon);

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex-shrink-0">
              <TagIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Category Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Elektronik, Giyim, Gıda..."
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Bu kategorinin detaylı açıklaması..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Order and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                  Sıra Numarası
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.order ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.order && (
                  <p className="text-red-600 text-sm mt-1">{errors.order}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">Aktif</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex-shrink-0">
              <SwatchIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Görsel Ayarlar</h3>
          </div>

          <div className="space-y-6">
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                İkon Seçimi
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {ICON_OPTIONS.map((iconOption) => (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.value }))}
                    className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      formData.icon === iconOption.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={iconOption.label}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{iconOption.icon}</div>
                      <div className="text-xs text-gray-600">{iconOption.label.split(' ')[1]}</div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Seçilen: {selectedIcon?.label}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Renk Seçimi
              </label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center space-x-3">
                <span className="text-sm text-gray-700">Seçilen renk:</span>
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: formData.color }}
                ></div>
                <span className="text-sm font-mono text-gray-600">{formData.color}</span>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Önizleme
              </label>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div
                  className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-lg font-medium mr-4"
                  style={{ backgroundColor: formData.color }}
                >
                  {selectedIcon?.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {formData.name || 'Kategori Adı'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.description || 'Kategori açıklaması'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
            <span>{isEditing ? 'Güncelle' : 'Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
} 