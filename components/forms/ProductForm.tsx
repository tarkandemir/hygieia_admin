'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import ImageUpload from './ImageUpload';

interface Product {
  _id?: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  weight?: number;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  };
  supplier: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
  };
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  images: string[];
}

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const UNITS = [
  'adet',
  'kg',
  'gram',
  'litre',
  'metre',
  'cm',
  'mm',
  'ton',
  'koli',
  'paket',
  'deste',
  'çift'
];

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    category: product?.category || '',
    wholesalePrice: product?.wholesalePrice || 0,
    retailPrice: product?.retailPrice || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    unit: product?.unit || 'adet',
    weight: product?.weight || undefined,
    dimensions: {
      length: product?.dimensions?.length || undefined,
      width: product?.dimensions?.width || undefined,
      height: product?.dimensions?.height || undefined,
    },
    supplier: {
      name: product?.supplier?.name || '',
      contact: product?.supplier?.contact || '',
      email: product?.supplier?.email || '',
      phone: product?.supplier?.phone || '',
    },
    tags: Array.isArray(product?.tags) ? product.tags : [],
    status: product?.status || 'active',
    images: Array.isArray(product?.images) ? product.images : [],
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Product] as object,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseFloat(value);
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Product] as object,
          [child]: numValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gereklidir';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU kodu gereklidir';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçimi gereklidir';
    }

    if (!formData.wholesalePrice || formData.wholesalePrice <= 0) {
      newErrors.wholesalePrice = 'Geçerli bir toptan fiyat giriniz';
    }

    if (!formData.retailPrice || formData.retailPrice <= 0) {
      newErrors.retailPrice = 'Geçerli bir perakende fiyat giriniz';
    }

    if (formData.retailPrice <= formData.wholesalePrice) {
      newErrors.retailPrice = 'Perakende fiyat toptan fiyattan yüksek olmalıdır';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stok miktarı negatif olamaz';
    }

    if (formData.minStock < 0) {
      newErrors.minStock = 'Minimum stok negatif olamaz';
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
      const url = isEditing ? `/api/products/${product?._id}` : '/api/products';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(isEditing ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla oluşturuldu!');
        router.push('/products');
      } else {
        alert(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const profitMargin = formData.retailPrice && formData.wholesalePrice 
    ? ((formData.retailPrice - formData.wholesalePrice) / formData.wholesalePrice * 100).toFixed(1)
    : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0">
            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="Ürün adını giriniz"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU Kodu *
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono ${
                errors.sku ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="SKU-001"
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.sku}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="Ürün açıklaması..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            >
              <option value="">Kategori seçiniz</option>
              {categories.map(category => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="draft">Taslak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Fiyat Bilgileri</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="wholesalePrice" className="block text-sm font-medium text-gray-700 mb-2">
              Toptan Fiyat (TRY) *
            </label>
            <input
              type="number"
              id="wholesalePrice"
              name="wholesalePrice"
              step="0.01"
              min="0"
              value={formData.wholesalePrice || ''}
              onChange={handleNumberChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.wholesalePrice ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="0.00"
            />
            {errors.wholesalePrice && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.wholesalePrice}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Perakende Fiyat (TRY) *
            </label>
            <input
              type="number"
              id="retailPrice"
              name="retailPrice"
              step="0.01"
              min="0"
              value={formData.retailPrice || ''}
              onChange={handleNumberChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.retailPrice ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="0.00"
            />
            {errors.retailPrice && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.retailPrice}
              </p>
            )}
          </div>

          {formData.wholesalePrice > 0 && formData.retailPrice > 0 && (
            <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Kar Marjı:</span>
                <span className="text-lg font-bold text-green-600">%{profitMargin}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Birim kar: {(formData.retailPrice - formData.wholesalePrice).toFixed(2)} TRY
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0">
            <CubeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Stok Bilgileri</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Stok
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              value={formData.stock || ''}
              onChange={handleNumberChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="0"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.stock}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Stok
            </label>
            <input
              type="number"
              id="minStock"
              name="minStock"
              min="0"
              value={formData.minStock || ''}
              onChange={handleNumberChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.minStock ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="0"
            />
            {errors.minStock && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.minStock}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
              Birim
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {formData.stock > 0 && formData.minStock > 0 && formData.stock <= formData.minStock && (
            <div className="md:col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Uyarı: Mevcut stok minimum stok seviyesinde veya altında!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Physical Properties */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0">
            <ScaleIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Fiziksel Özellikler</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Ağırlık (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              step="0.01"
              min="0"
              value={formData.weight || ''}
              onChange={handleNumberChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="dimensions.length" className="block text-sm font-medium text-gray-700 mb-2">
              Uzunluk (cm)
            </label>
            <input
              type="number"
              id="dimensions.length"
              name="dimensions.length"
              step="0.01"
              min="0"
              value={formData.dimensions.length || ''}
              onChange={handleNumberChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="dimensions.width" className="block text-sm font-medium text-gray-700 mb-2">
              Genişlik (cm)
            </label>
            <input
              type="number"
              id="dimensions.width"
              name="dimensions.width"
              step="0.01"
              min="0"
              value={formData.dimensions.width || ''}
              onChange={handleNumberChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="dimensions.height" className="block text-sm font-medium text-gray-700 mb-2">
              Yükseklik (cm)
            </label>
            <input
              type="number"
              id="dimensions.height"
              name="dimensions.height"
              step="0.01"
              min="0"
              value={formData.dimensions.height || ''}
              onChange={handleNumberChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0">
            <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Tedarikçi Bilgileri</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="supplier.name" className="block text-sm font-medium text-gray-700 mb-2">
              Tedarikçi Adı
            </label>
            <input
              type="text"
              id="supplier.name"
              name="supplier.name"
              value={formData.supplier.name || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="Tedarikçi firma adı"
            />
          </div>

          <div>
            <label htmlFor="supplier.contact" className="block text-sm font-medium text-gray-700 mb-2">
              İletişim Kişisi
            </label>
            <input
              type="text"
              id="supplier.contact"
              name="supplier.contact"
              value={formData.supplier.contact || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="İletişim kişisi adı"
            />
          </div>

          <div>
            <label htmlFor="supplier.email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <input
              type="email"
              id="supplier.email"
              name="supplier.email"
              value={formData.supplier.email || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="tedarikci@firma.com"
            />
          </div>

          <div>
            <label htmlFor="supplier.phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              id="supplier.phone"
              name="supplier.phone"
              value={formData.supplier.phone || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="+90 555 123 45 67"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0">
            <TagIcon className="h-6 w-6 text-pink-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Etiketler</h3>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              placeholder="Yeni etiket ekleyin..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Ekle
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Images */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0">
            <PhotoIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Ürün Resimleri</h3>
        </div>

        <ImageUpload
          images={formData.images}
          onImagesChange={handleImagesChange}
          maxImages={5}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading 
            ? (isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...') 
            : (isEditing ? 'Ürünü Güncelle' : 'Ürünü Oluştur')
          }
        </button>
      </div>
    </form>
  );
} 