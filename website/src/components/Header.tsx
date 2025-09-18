'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useCategories } from '@/hooks/useCategories';
import { useLoading } from '@/contexts/LoadingContext';
import { Phone, Search, ShoppingBag, ChevronDown, X } from 'lucide-react';

interface HeaderProps {
  activeLink?: string;
}

export default function Header({ activeLink }: HeaderProps) {
  const { getItemCount } = useCart();
  const { categories } = useCategories();
  const { startLoading } = useLoading();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const itemCount = getItemCount();

  const handleLinkClick = () => {
    startLoading();
    setIsDropdownOpen(false);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setIsSearchOpen(false);
    
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleNavigationClick = (url: string) => {
    startLoading();
    setIsDropdownOpen(false);
    setIsSearchOpen(false);
    // Small delay to show loading before navigation
    setTimeout(() => {
      window.location.href = url;
    }, 100);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      startLoading();
      setIsSearchOpen(false);
      setIsDropdownOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsDropdownOpen(false);
    if (!isSearchOpen) {
      // Focus search input after animation
      setTimeout(() => {
        const searchInput = document.getElementById('header-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  return (
    <header className="bg-[#000080] text-white">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Hygieia"
              width={125}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, 'about')}
              className={`text-sm font-semibold hover:text-[#6AF0D2] transition-colors cursor-pointer ${
                activeLink === 'about' ? 'text-[#6AF0D2]' : ''
              }`}
            >
              Hakkımızda
            </a>
            <a
              href="#services"
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className={`text-sm font-semibold hover:text-[#6AF0D2] transition-colors cursor-pointer ${
                activeLink === 'services' ? 'text-[#6AF0D2]' : ''
              }`}
            >
              Hizmetlerimiz
            </a>
            <div className={`relative ${activeLink === 'products' ? 'border-b-2 border-[#6AF0D2]' : ''}`}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center space-x-1 text-sm font-semibold hover:text-[#6AF0D2] transition-colors ${
                  activeLink === 'products' ? 'text-[#6AF0D2]' : ''
                }`}
              >
                <span>Ürünler</span>
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => handleNavigationClick('/products')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#000069]"
                  >
                    Tüm Ürünler
                  </button>
                  <div className="border-t border-gray-100 my-2"></div>
                  {categories
                    .filter(category => category.productCount > 0)
                    .slice(0, 8)
                    .map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleNavigationClick(`/kategori/${category.slug}`)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#000069]"
                    >
                      {category.name}
                    </button>
                  ))}
                  {categories.filter(category => category.productCount > 0).length > 8 && (
                    <>
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={() => handleNavigationClick('/products')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-[#000069]"
                      >
                        Daha fazla kategori...
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className={`text-sm font-semibold hover:text-[#6AF0D2] transition-colors cursor-pointer ${
                activeLink === 'contact' ? 'text-[#6AF0D2]' : ''
              }`}
            >
              İletişim
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Call Button */}
            <a
              href="tel:+902121234567"
              className="hidden md:flex items-center space-x-1 bg-[#6AF0D2] text-[#000080] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#5BE0C2] transition-colors"
            >
              <Phone size={12} />
              <span>Bizi Arayın</span>
            </a>

            {/* Search Button */}
            <button 
              onClick={handleSearchToggle}
              className="p-2 border border-[#6AF0D2] rounded-lg hover:bg-[#6AF0D2] hover:text-[#000080] transition-colors"
            >
              <Search size={14} />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => handleNavigationClick('/cart')}
              className="relative p-2 border border-[#6AF0D2] rounded-lg hover:bg-[#6AF0D2] hover:text-[#000080] transition-colors"
            >
              <ShoppingBag size={14} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#6AF0D2] text-[#000080] text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Call Button */}
        <div className="md:hidden mt-4 flex justify-center">
          <a
            href="tel:+902121234567"
            className="flex items-center space-x-1 text-[#6AF0D2] font-semibold text-sm"
          >
            <Phone size={12} />
            <span>Bizi Arayın</span>
          </a>
        </div>
        
        {/* Search Bar - Expanded */}
        {isSearchOpen && (
          <div className="mt-4 border-t border-[#6AF0D2]/30 pt-4">
            <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
              <input
                id="header-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-[#6AF0D2]/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#6AF0D2] focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6AF0D2] hover:text-white transition-colors"
              >
                <Search size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute -right-10 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
