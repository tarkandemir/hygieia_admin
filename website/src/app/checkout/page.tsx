'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { useCart } from '@/contexts/CartContext';
import { formatPriceSimple, generateOrderNumber } from '@/lib/utils';
import { ICustomer, IAddress } from '@/types';
import { ArrowLeft, Phone } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customer, setCustomer] = useState<ICustomer>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    company: '',
    taxId: '',
  });

  const [address, setAddress] = useState<IAddress>({
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    district: '',
    neighborhood: '',
    postalCode: '',
    country: 'Türkiye',
    phone: '',
  });

  const breadcrumbItems = [
    { label: 'Sepetim', href: '/cart' },
    { label: 'Teslimat' },
  ];

  // Progress steps
  const steps = [
    { id: 'cart', label: 'Sepet', active: false, completed: true },
    { id: 'delivery', label: 'Teslimat', active: true, completed: false },
    { id: 'summary', label: 'Sipariş Özeti', active: false, completed: false },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate order creation
      const orderNumber = generateOrderNumber();
      
      // In a real app, you would submit to your API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to success page
      clearCart();
      router.push(`/order-success?orderNumber=${orderNumber}`);
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Sepetiniz boş
          </h2>
          <p className="text-gray-600 mb-8">
            Checkout yapabilmek için sepetinizde ürün bulunması gerekiyor.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-[#000069] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#000080] transition-colors"
          >
            <span>Alışverişe Başla</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <div className="container mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.active
                        ? 'bg-[#6AF0D2] text-[#000069]'
                        : step.completed
                        ? 'bg-[#000069] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      step.active ? 'text-[#000069]' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-200 mx-4 mt-5"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Delivery Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  İletişim Bilgileri
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.surname}
                      onChange={(e) => setCustomer({ ...customer, surname: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Firma Adı
                    </label>
                    <input
                      type="text"
                      value={customer.company}
                      onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vergi No
                    </label>
                    <input
                      type="text"
                      value={customer.taxId}
                      onChange={(e) => setCustomer({ ...customer, taxId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Adres Bilgileri
                </h3>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İl *
                      </label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İlçe *
                      </label>
                      <input
                        type="text"
                        required
                        value={address.district}
                        onChange={(e) => setAddress({ ...address, district: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mahalle *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tam Adres *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={address.address1}
                      onChange={(e) => setAddress({ ...address, address1: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Continue Shopping Link */}
              <div className="flex justify-between items-center">
                <a
                  href="/cart"
                  className="inline-flex items-center space-x-2 text-[#000069] hover:text-[#000080] font-medium"
                >
                  <ArrowLeft size={16} />
                  <span>Sepete Dön</span>
                </a>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Sipariş Özeti
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-medium">
                      {formatPriceSimple(cart.subtotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Teslimat</span>
                    <span className="font-medium text-green-600">
                      {cart.shippingCost === 0 ? 'Ücretsiz' : formatPriceSimple(cart.shippingCost)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Toplam</span>
                      <span className="text-[#000069]">
                        {formatPriceSimple(cart.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#000069] text-white py-3 rounded-lg font-semibold hover:bg-[#000080] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
                >
                  {isSubmitting ? 'Siparişiniz Oluşturuluyor...' : 'Siparişi Tamamla'}
                </button>

                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500">
                    Sorularınız için{' '}
                    <a href="tel:+902121234567" className="text-[#000069] hover:underline">
                      bizi arayın
                    </a>
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <button
                      type="button"
                      className="flex items-center space-x-1 text-[#000069] hover:underline"
                    >
                      <Phone size={12} />
                      <span>Bizi Arayın</span>
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      className="text-[#000069] hover:underline"
                    >
                      Bize Yazın
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
