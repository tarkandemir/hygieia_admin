'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Product {
  _id: string;
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
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  status: 'active' | 'inactive' | 'draft';
  supplier: {
    name?: string;
    contact?: string;
  };
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  categories: string[];
}

export default function ProductsPage() {
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Advanced Filter states
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [minWholesalePrice, setMinWholesalePrice] = useState('');
  const [maxWholesalePrice, setMaxWholesalePrice] = useState('');
  const [minRetailPrice, setMinRetailPrice] = useState('');
  const [maxRetailPrice, setMaxRetailPrice] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Import/Export states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  // Helper functions for advanced filtering
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setMinWholesalePrice('');
    setMaxWholesalePrice('');
    setMinRetailPrice('');
    setMaxRetailPrice('');
    setStockFilter('');
    setMinStock('');
    setMaxStock('');
    setSupplierSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return search || selectedCategories.length > 0 || selectedStatuses.length > 0 || 
           minWholesalePrice || maxWholesalePrice || minRetailPrice || maxRetailPrice ||
           stockFilter || minStock || maxStock || supplierSearch;
  };

  useEffect(() => {
    fetchProducts();
    fetchCurrentUser();
  }, [search, selectedCategories, selectedStatuses, minWholesalePrice, maxWholesalePrice, 
      minRetailPrice, maxRetailPrice, stockFilter, minStock, maxStock, supplierSearch, currentPage]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategories.length > 0) params.append('categories', selectedCategories.join(','));
      if (selectedStatuses.length > 0) params.append('statuses', selectedStatuses.join(','));
      if (minWholesalePrice) params.append('minWholesalePrice', minWholesalePrice);
      if (maxWholesalePrice) params.append('maxWholesalePrice', maxWholesalePrice);
      if (minRetailPrice) params.append('minRetailPrice', minRetailPrice);
      if (maxRetailPrice) params.append('maxRetailPrice', maxRetailPrice);
      if (stockFilter) params.append('stockFilter', stockFilter);
      if (minStock) params.append('minStock', minStock);
      if (maxStock) params.append('maxStock', maxStock);
      if (supplierSearch) params.append('supplierSearch', supplierSearch);
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 API Response:', data);
        console.log('🔍 First Product:', data.products?.[0]);
        setProductsData(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchProducts();
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Ürün silinirken hata oluştu');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Ürün silinirken hata oluştu');
      }
    }
  };

  const handleExportProducts = async () => {
    try {
      // Tüm ürünleri al (all=true parametresi ile)
      const response = await fetch('/api/products?all=true');
      if (response.ok) {
        const data = await response.json();
        const products = data.products;
        
        // CSV başlıkları
        const csvHeaders = [
          'Name', 'Description', 'SKU', 'Category', 'Wholesale Price', 'Retail Price',
          'Stock', 'Min Stock', 'Unit', 'Weight', 'Length', 'Width', 'Height', 
          'Supplier Name', 'Status', 'Tags'
        ];
        
        // CSV satırları
        const csvRows = products.map((product: Product) => [
          product.name,
          product.description || '',
          product.sku,
          product.category,
          product.wholesalePrice,
          product.retailPrice,
          product.stock,
          product.minStock,
          product.unit,
          product.weight || '',
          product.dimensions?.length || '',
          product.dimensions?.width || '',
          product.dimensions?.height || '',
          product.supplier?.name || '',
          product.status,
          product.description || ''
        ]);
        
        // CSV içeriği oluştur
        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map((row: any) => row.map((field: any) => 
            typeof field === 'string' ? `"${field.replace(/"/g, '""')}"` : field
          ).join(','))
        ].join('\n');
        
        // Dosya indirme
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `urunler_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Ürünler başarıyla dışa aktarıldı!');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Dışa aktarma sırasında hata oluştu');
    }
  };

  const handleImportProducts = async () => {
    if (!importFile) {
      alert('Lütfen bir dosya seçin');
      return;
    }

    setImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Başarılı! ${result.imported} ürün içe aktarıldı.`);
        setShowImportModal(false);
        setImportFile(null);
        fetchProducts(); // Listeyi yenile
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'İçe aktarma sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('İçe aktarma sırasında hata oluştu');
    } finally {
      setImporting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatStock = (stock: number, minStock: number) => {
    const isLowStock = stock <= minStock;
    return (
      <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
        {stock}
        {isLowStock && ' ⚠️'}
      </span>
    );
  };

  // Bulk Operations Functions
  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(productsData?.products.map(product => product._id) || []);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedProducts.length === 0) return;
    
    setBulkLoading(true);
    try {
      const response = await fetch('/api/products/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          productIds: selectedProducts,
          status
        }),
      });

      if (response.ok) {
        fetchProducts();
        setSelectedProducts([]);
        setShowBulkActions(false);
      } else {
        const errorData = await response.json();
        alert(`İşlem başarısız: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Bulk status update error:', error);
      alert('Toplu durum güncellemesi sırasında hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkCategoryChange = async (newCategory: string) => {
    if (selectedProducts.length === 0) return;
    
    setBulkLoading(true);
    try {
      const response = await fetch('/api/products/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateCategory',
          productIds: selectedProducts,
          category: newCategory
        }),
      });

      if (response.ok) {
        fetchProducts();
        setSelectedProducts([]);
        setShowBulkActions(false);
      } else {
        const errorData = await response.json();
        alert(`İşlem başarısız: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Bulk category update error:', error);
      alert('Toplu kategori güncellemesi sırasında hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`${selectedProducts.length} ürünü silmek istediğinizden emin misiniz?`)) {
      setBulkLoading(true);
      try {
        const response = await fetch('/api/products/bulk', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productIds: selectedProducts
          }),
        });

        if (response.ok) {
          fetchProducts();
          setSelectedProducts([]);
          setShowBulkActions(false);
        } else {
          const errorData = await response.json();
          alert(`İşlem başarısız: ${errorData.error || 'Bilinmeyen hata'}`);
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Toplu silme işlemi sırasında hata oluştu');
      } finally {
        setBulkLoading(false);
      }
    }
  };

  // Update bulk actions visibility when selection changes
  useEffect(() => {
    setShowBulkActions(selectedProducts.length > 0);
  }, [selectedProducts]);

  const canCreateProduct = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const canEditProduct = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const canDeleteProduct = currentUser?.role === 'admin';
  const canImportExport = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
            <p className="text-gray-600">B2B ürünlerinizi yönetin</p>
          </div>
          <div className="flex items-center space-x-3">
            {canImportExport && (
              <>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center space-x-2"
                >
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span>İçe Aktar</span>
                </button>
                <button 
                  onClick={handleExportProducts}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Dışa Aktar</span>
                </button>
              </>
            )}
            {canCreateProduct && (
              <Link
                href="/products/new"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Yeni Ürün</span>
              </Link>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtreler</h3>
            <div className="flex items-center space-x-3">
              {hasActiveFilters() && (
                <button
                  onClick={resetAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Tümünü Temizle</span>
                </button>
              )}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Gelişmiş Filtreler</span>
              </button>
            </div>
          </div>

          {/* Basic Search */}
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün adı, SKU, açıklama veya tedarikçi ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-4 space-y-6">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Kategoriler</label>
                <div className="flex flex-wrap gap-2">
                  {productsData?.categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        selectedCategories.includes(category)
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Durum</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'active', label: 'Aktif' },
                    { value: 'inactive', label: 'Pasif' },
                    { value: 'draft', label: 'Taslak' },
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusToggle(status.value)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        selectedStatuses.includes(status.value)
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Ranges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Fiyat Aralıkları</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Toptan Fiyat</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minWholesalePrice}
                        onChange={(e) => setMinWholesalePrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxWholesalePrice}
                        onChange={(e) => setMaxWholesalePrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Perakende Fiyat</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minRetailPrice}
                        onChange={(e) => setMinRetailPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxRetailPrice}
                        onChange={(e) => setMaxRetailPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Stok Durumu</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { value: '', label: 'Tümü' },
                    { value: 'inStock', label: 'Stokta Var' },
                    { value: 'lowStock', label: 'Düşük Stok' },
                    { value: 'outOfStock', label: 'Stok Yok' },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setStockFilter(filter.value)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        stockFilter === filter.value
                          ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Minimum Stok</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Maksimum Stok</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={maxStock}
                      onChange={(e) => setMaxStock(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Supplier Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tedarikçi Bilgileri</label>
                <input
                  type="text"
                  placeholder="Tedarikçi adı veya iletişim bilgisi ara..."
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProducts.length} ürün seçildi
                </span>
                <button
                  onClick={() => {
                    setSelectedProducts([]);
                    setShowBulkActions(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Seçimi Temizle
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Aktif Yap
                </button>
                <button
                  onClick={() => handleBulkStatusChange('inactive')}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  Pasif Yap
                </button>
                
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkCategoryChange(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  disabled={bulkLoading}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">Kategori Değiştir</option>
                  {productsData?.categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {bulkLoading ? 'İşleniyor...' : 'Sil'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Ürünler ({productsData?.pagination.total || 0})
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
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === (productsData?.products.length || 0) && (productsData?.products.length || 0) > 0}
                        onChange={(e) => handleSelectAllProducts(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat (Toptan/Perakende)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productsData?.products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatPrice(product.wholesalePrice)}</div>
                          <div className="text-gray-500">{formatPrice(product.retailPrice)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatStock(product.stock, product.minStock)}
                        <div className="text-xs text-gray-500">Min: {product.minStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status === 'active' ? 'Aktif' : product.status === 'inactive' ? 'Pasif' : 'Taslak'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/products/${product._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          {canEditProduct && (
                            <Link
                              href={`/products/${product._id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          )}
                          {canDeleteProduct && (
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Sayfa {productsData.pagination.page} / {productsData.pagination.pages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(productsData.pagination.pages, currentPage + 1))}
                    disabled={currentPage === productsData.pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ürün İçe Aktarma</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Dosyası Seçin
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Örnek CSV dosyasını <a href="/sample-products.csv" download className="text-indigo-600 hover:text-indigo-800">buradan</a> indirebilirsiniz.
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleImportProducts}
                    disabled={!importFile || importing}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {importing ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 