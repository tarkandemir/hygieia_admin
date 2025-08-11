import AdminLayout from '@/components/layout/AdminLayout';
import ProductForm from '@/components/forms/ProductForm';

export default function NewProductPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <p className="text-gray-600">B2B ürün kataloğunuza yeni bir ürün ekleyin</p>
        </div>

        <ProductForm />
      </div>
    </AdminLayout>
  );
} 