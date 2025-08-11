'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  HomeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  sku: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  category: string;
}

interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Address {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface Order {
  _id?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    taxId?: string;
  };
  billingAddress: Address;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  notes?: string;
  internalNotes?: string;
  estimatedDeliveryDate?: string;
}

interface OrderFormProps {
  order?: Order;
  isEditing?: boolean;
}

export default function OrderForm({ order, isEditing = false }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [formData, setFormData] = useState<Order>({
    customer: {
      name: order?.customer?.name || '',
      email: order?.customer?.email || '',
      phone: order?.customer?.phone || '',
      company: order?.customer?.company || '',
      taxId: order?.customer?.taxId || '',
    },
    billingAddress: {
      name: order?.billingAddress?.name || '',
      company: order?.billingAddress?.company || '',
      address1: order?.billingAddress?.address1 || '',
      address2: order?.billingAddress?.address2 || '',
      city: order?.billingAddress?.city || '',
      state: order?.billingAddress?.state || '',
      postalCode: order?.billingAddress?.postalCode || '',
      country: order?.billingAddress?.country || 'Türkiye',
      phone: order?.billingAddress?.phone || '',
    },
    shippingAddress: {
      name: order?.shippingAddress?.name || '',
      company: order?.shippingAddress?.company || '',
      address1: order?.shippingAddress?.address1 || '',
      address2: order?.shippingAddress?.address2 || '',
      city: order?.shippingAddress?.city || '',
      state: order?.shippingAddress?.state || '',
      postalCode: order?.shippingAddress?.postalCode || '',
      country: order?.shippingAddress?.country || 'Türkiye',
      phone: order?.shippingAddress?.phone || '',
    },
    items: order?.items || [],
    subtotal: order?.subtotal || 0,
    taxAmount: order?.taxAmount || 0,
    shippingCost: order?.shippingCost || 0,
    discountAmount: order?.discountAmount || 0,
    totalAmount: order?.totalAmount || 0,
    status: order?.status || 'pending',
    paymentStatus: order?.paymentStatus || 'pending',
    paymentMethod: order?.paymentMethod || 'bank_transfer',
    notes: order?.notes || '',
    internalNotes: order?.internalNotes || '',
    estimatedDeliveryDate: order?.estimatedDeliveryDate || '',
  });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxAmount, formData.shippingCost, formData.discountAmount]);

  useEffect(() => {
    if (sameAsBilling) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress }
      }));
    }
  }, [sameAsBilling, formData.billingAddress]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        limit: '20',
        status: 'active',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal + formData.taxAmount + formData.shippingCost - formData.discountAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      totalAmount,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const [section, field] = name.split('.');

    if (section && field) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof Order] as any),
          [field]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addProduct = (product: Product) => {
    const existingItemIndex = formData.items.findIndex(item => item.productId === product._id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      const newItem: OrderItem = {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.wholesalePrice,
        totalPrice: product.wholesalePrice,
      };

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    const updatedItems = [...formData.items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].totalPrice = quantity * updatedItems[index].unitPrice;

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const updateItemPrice = (index: number, unitPrice: number) => {
    const updatedItems = [...formData.items];
    updatedItems[index].unitPrice = unitPrice;
    updatedItems[index].totalPrice = updatedItems[index].quantity * unitPrice;

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Customer validation
    if (!formData.customer.name.trim()) {
      newErrors['customer.name'] = 'Müşteri adı gereklidir';
    }
    if (!formData.customer.email.trim()) {
      newErrors['customer.email'] = 'E-posta gereklidir';
    }
    if (!formData.customer.phone.trim()) {
      newErrors['customer.phone'] = 'Telefon gereklidir';
    }

    // Billing address validation
    if (!formData.billingAddress.name.trim()) {
      newErrors['billingAddress.name'] = 'Fatura adı gereklidir';
    }
    if (!formData.billingAddress.address1.trim()) {
      newErrors['billingAddress.address1'] = 'Adres gereklidir';
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors['billingAddress.city'] = 'Şehir gereklidir';
    }

    // Items validation
    if (formData.items.length === 0) {
      newErrors.items = 'En az bir ürün gereklidir';
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
      const url = isEditing ? `/api/orders/${order?._id}` : '/api/orders';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/orders');
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Sipariş kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Müşteri Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müşteri Adı *
              </label>
              <input
                type="text"
                name="customer.name"
                value={formData.customer.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors['customer.name'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ahmet Yılmaz"
              />
              {errors['customer.name'] && (
                <p className="text-red-600 text-sm mt-1">{errors['customer.name']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta *
              </label>
              <input
                type="email"
                name="customer.email"
                value={formData.customer.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors['customer.email'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ahmet@sirket.com"
              />
              {errors['customer.email'] && (
                <p className="text-red-600 text-sm mt-1">{errors['customer.email']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon *
              </label>
              <input
                type="tel"
                name="customer.phone"
                value={formData.customer.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors['customer.phone'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+90 555 123 45 67"
              />
              {errors['customer.phone'] && (
                <p className="text-red-600 text-sm mt-1">{errors['customer.phone']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şirket
              </label>
              <input
                type="text"
                name="customer.company"
                value={formData.customer.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="ABC Şirketi Ltd."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vergi Numarası
              </label>
              <input
                type="text"
                name="customer.taxId"
                value={formData.customer.taxId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1234567890"
              />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <HomeIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Fatura Adresi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad *
              </label>
              <input
                type="text"
                name="billingAddress.name"
                value={formData.billingAddress.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors['billingAddress.name'] ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors['billingAddress.name'] && (
                <p className="text-red-600 text-sm mt-1">{errors['billingAddress.name']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şirket
              </label>
              <input
                type="text"
                name="billingAddress.company"
                value={formData.billingAddress.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres 1 *
              </label>
              <input
                type="text"
                name="billingAddress.address1"
                value={formData.billingAddress.address1}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors['billingAddress.address1'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Sokak, No, Mahalle"
              />
              {errors['billingAddress.address1'] && (
                <p className="text-red-600 text-sm mt-1">{errors['billingAddress.address1']}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres 2
              </label>
              <input
                type="text"
                name="billingAddress.address2"
                value={formData.billingAddress.address2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Kat, Daire, vb."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir *
              </label>
              <input
                type="text"
                name="billingAddress.city"
                value={formData.billingAddress.city}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors['billingAddress.city'] ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors['billingAddress.city'] && (
                <p className="text-red-600 text-sm mt-1">{errors['billingAddress.city']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İl/Bölge
              </label>
              <input
                type="text"
                name="billingAddress.state"
                value={formData.billingAddress.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posta Kodu
              </label>
              <input
                type="text"
                name="billingAddress.postalCode"
                value={formData.billingAddress.postalCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                name="billingAddress.phone"
                value={formData.billingAddress.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <HomeIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Teslimat Adresi</h3>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">Fatura adresi ile aynı</span>
            </label>
          </div>

          {!sameAsBilling && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  name="shippingAddress.name"
                  value={formData.shippingAddress.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket
                </label>
                <input
                  type="text"
                  name="shippingAddress.company"
                  value={formData.shippingAddress.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres 1 *
                </label>
                <input
                  type="text"
                  name="shippingAddress.address1"
                  value={formData.shippingAddress.address1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Sokak, No, Mahalle"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres 2
                </label>
                <input
                  type="text"
                  name="shippingAddress.address2"
                  value={formData.shippingAddress.address2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Kat, Daire, vb."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir *
                </label>
                <input
                  type="text"
                  name="shippingAddress.city"
                  value={formData.shippingAddress.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İl/Bölge
                </label>
                <input
                  type="text"
                  name="shippingAddress.state"
                  value={formData.shippingAddress.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posta Kodu
                </label>
                <input
                  type="text"
                  name="shippingAddress.postalCode"
                  value={formData.shippingAddress.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="shippingAddress.phone"
                  value={formData.shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <ShoppingCartIcon className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sipariş Ürünleri</h3>
          </div>

          {/* Product Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Arama
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün adı veya SKU ile arayın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            {searchTerm && products.length > 0 && (
              <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => addProduct(product)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">SKU: {product.sku} | Stok: {product.stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(product.wholesalePrice)}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Items List */}
          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz ürün eklenmedi. Yukarıdaki arama kutusunu kullanarak ürün ekleyin.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="text-sm text-gray-500">adet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItemPrice(index, parseFloat(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="text-sm text-gray-500">TRY</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(item.totalPrice)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.items && (
            <p className="text-red-600 text-sm mt-2">{errors.items}</p>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Fiyatlandırma</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KDV Tutarı
              </label>
              <input
                type="number"
                name="taxAmount"
                step="0.01"
                value={formData.taxAmount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kargo Ücreti
              </label>
              <input
                type="number"
                name="shippingCost"
                step="0.01"
                value={formData.shippingCost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İndirim Tutarı
              </label>
              <input
                type="number"
                name="discountAmount"
                step="0.01"
                value={formData.discountAmount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahmini Teslimat Tarihi
              </label>
              <input
                type="date"
                name="estimatedDeliveryDate"
                value={formData.estimatedDeliveryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ara Toplam:</span>
                <span className="font-medium">{formatPrice(formData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">KDV:</span>
                <span className="font-medium">{formatPrice(formData.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kargo:</span>
                <span className="font-medium">{formatPrice(formData.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">İndirim:</span>
                <span className="font-medium text-red-600">-{formatPrice(formData.discountAmount)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Toplam:</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(formData.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sipariş Detayları</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Durumu
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="pending">Beklemede</option>
                <option value="confirmed">Onaylandı</option>
                <option value="processing">Hazırlanıyor</option>
                <option value="shipped">Kargoda</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Durumu
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="pending">Beklemede</option>
                <option value="paid">Ödendi</option>
                <option value="failed">Başarısız</option>
                <option value="refunded">İade Edildi</option>
                <option value="partial">Kısmi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Yöntemi
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="bank_transfer">Banka Havalesi</option>
                <option value="credit_card">Kredi Kartı</option>
                <option value="cash">Nakit</option>
                <option value="check">Çek</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müşteri Notları
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Müşteri notları..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İç Notlar
              </label>
              <textarea
                name="internalNotes"
                value={formData.internalNotes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="İç notlar (müşteri görmez)..."
              />
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