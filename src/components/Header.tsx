import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import { ShoppingBag, User, Search, Menu, X, ShieldAlert, Phone, ChevronRight, Truck } from 'lucide-react';

export default function Header() {
  const { cartCount, user, showCartDrawer, setShowCartDrawer, navigateTo, currentPath, settings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const whatsappNum = settings?.whatsappNumber || '94753237633';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Men', path: '/shop?category=men' },
    { name: 'Women', path: '/shop?category=women' },
    { name: 'Unisex', path: '/shop?category=unisex' },
    { name: 'Accessories', path: '/shop?category=accessories' },
    { name: 'Sale ⚡', path: '/shop?category=sale', highlight: true },
    { name: 'Track Order', path: '/track' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-gray-100 font-sans" id="comfalo-header">
      {/* Announcement Bar */}
      <div className="bg-[#111111] text-white text-[10px] sm:text-[11px] tracking-[0.15em] py-2 px-3 text-center font-medium uppercase overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="mx-4">⚡ FREE ISLANDWIDE DELIVERY FOR ORDERS ABOVE RS. 7,500 • COD & WHATSAPP ORDERS ACCEPTED • 2–4 WORKING DAYS ESTIMATED DELIVERY ⚡</span>
          <span className="mx-4">⚡ FREE ISLANDWIDE DELIVERY FOR ORDERS ABOVE RS. 7,500 • COD & WHATSAPP ORDERS ACCEPTED • 2–4 WORKING DAYS ESTIMATED DELIVERY ⚡</span>
        </div>
      </div>

      {/* Main Navigation Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20 md:h-24">
          
          {/* Mobile Hamburger Menu Button */}
          <div className="flex md:hidden items-center z-20">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-[#111111] p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu size={26} />
            </button>
          </div>

          {/* Brand Logo - Absolutely Centered on Mobile (< md), Normal Flow on Desktop (>= md) */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 cursor-pointer py-1 z-10" 
            onClick={() => navigateTo('/')}
          >
            <div className="block md:hidden">
              <Logo size="sm" showText={true} />
            </div>
            <div className="hidden md:block">
              <Logo size="lg" showText={true} />
            </div>
          </div>

          {/* Desktop Navigation Links (Hidden on Mobile) */}
          <nav className="hidden md:flex space-x-6 lg:space-x-10">
            {navLinks.map((link) => {
              const isActive = currentPath.startsWith(link.path.split('?')[0]) && 
                (link.path.includes('?') ? currentPath.includes(link.path.split('?')[1]) : true);
              return (
                <button
                  key={link.name}
                  onClick={() => navigateTo(link.path)}
                  className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#E63946] py-2 cursor-pointer ${
                    link.highlight 
                      ? 'text-[#E63946] font-semibold' 
                      : isActive 
                        ? 'text-[#111111] border-b-2 border-[#111111]' 
                        : 'text-gray-600'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Utility Tools (Search, Account, Cart) */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Input on Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
              <input
                type="text"
                placeholder="SEARCH COMFALO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 hover:bg-gray-200/75 focus:bg-white focus:ring-1 focus:ring-[#111111] focus:border-[#111111] rounded-none py-1.5 pl-3 pr-8 text-[11px] tracking-[0.1em] text-[#111111] border-none w-40 xl:w-48 transition-all duration-300 uppercase outline-none"
              />
              <button type="submit" className="absolute right-2 text-[#111111] opacity-70 hover:opacity-100">
                <Search size={14} />
              </button>
            </form>

            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden text-[#111111] p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Search products"
              aria-label="Toggle search bar"
            >
              <Search size={22} />
            </button>

            {/* Account Icon */}
            <button
              onClick={() => navigateTo('/account')}
              className={`p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer relative ${
                currentPath.startsWith('/account') ? 'text-[#E63946]' : 'text-[#111111]'
              }`}
              title={user ? `Hello, ${user.fullName}` : 'My Account'}
              aria-label="User Account"
            >
              <User size={22} />
              {user && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Admin Link (If logged in as Admin) */}
            {user && user.userType === 'admin' && (
              <button
                onClick={() => navigateTo('/admin')}
                className={`p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer relative ${
                  currentPath.startsWith('/admin') ? 'text-red-600' : 'text-gray-700'
                }`}
                title="Admin Control Center"
              >
                <ShieldAlert size={22} />
              </button>
            )}

            {/* Cart Icon Drawer Trigger */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer text-[#111111]"
              aria-label="Open shopping cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E63946] text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#FAFAFA] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown Input Bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-3 pt-1 px-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="flex items-center relative">
              <input
                type="text"
                placeholder="Search products, tees, hoodies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white border border-gray-300 rounded-full py-2 pl-4 pr-10 text-xs tracking-wide text-[#111111] focus:outline-none focus:border-[#111111] uppercase"
              />
              <button type="submit" className="absolute right-3 text-gray-700 hover:text-[#111111]">
                <Search size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* --- FULLY RESPONSIVE MOBILE SLIDE-OUT MENU DRAWER --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden" id="mobile-menu-modal">
          {/* Dark Translucent Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Slide-out Sidebar Drawer - GUARANTEED 100% VIEWPORT HEIGHT */}
          <div className="relative flex flex-col w-[85%] max-w-xs bg-white h-screen h-[100dvh] shadow-2xl z-[101] py-6 px-5 overflow-y-auto animate-in slide-in-from-left duration-300">
            
            {/* Mobile Drawer Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <Logo size="sm" showText={true} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#111111] p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Search inside Drawer */}
            <form onSubmit={handleSearchSubmit} className="my-5 relative flex items-center shrink-0">
              <input
                type="text"
                placeholder="Search streetwear items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 focus:bg-white border border-gray-200 focus:border-[#111111] rounded-lg py-2.5 pl-3 pr-9 text-xs tracking-wider text-[#111111] w-full outline-none uppercase"
              />
              <button type="submit" className="absolute right-3 text-gray-600">
                <Search size={16} />
              </button>
            </form>

            {/* Main Navigation Links */}
            <div className="mb-4 shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">COLLECTIONS</p>
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      navigateTo(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between text-xs uppercase tracking-[0.18em] font-semibold text-left py-3 px-3 rounded-lg transition-colors ${
                      link.highlight 
                        ? 'bg-orange-50 text-[#FF6B00]' 
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                ))}
              </nav>
            </div>

            {/* Customer Care / Quick Access */}
            <div className="mt-2 pt-4 border-t border-gray-100 shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">ACCOUNT & HELP</p>
              
              <div className="flex flex-col space-y-1">
                {user ? (
                  <button
                    onClick={() => {
                      navigateTo('/account');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between text-xs uppercase tracking-[0.15em] font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <User size={16} />
                      {user.fullName}
                    </span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigateTo('/account');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between text-xs uppercase tracking-[0.15em] font-semibold text-[#111111] py-2.5 px-3 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <User size={16} />
                      Sign In / Register
                    </span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                )}

                {/* WhatsApp Support Direct Button */}
                <a
                  href={`https://wa.me/${whatsappNum}?text=Hi%20Comfalo,%20I%20need%20help%20with%20an%20order`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs uppercase tracking-[0.15em] font-semibold text-[#075E54] bg-green-50 py-2.5 px-3 rounded-lg text-left"
                >
                  <span className="flex items-center gap-2">
                    <Phone size={16} />
                    WhatsApp Order Support
                  </span>
                  <ChevronRight size={14} className="text-green-600" />
                </a>

                {/* Admin Portal Link */}
                {user && user.userType === 'admin' && (
                  <button
                    onClick={() => {
                      navigateTo('/admin');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between text-xs uppercase tracking-[0.15em] font-bold text-orange-600 bg-orange-50 py-2.5 px-3 rounded-lg text-left"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert size={16} />
                      Admin Dashboard
                    </span>
                    <ChevronRight size={14} className="text-orange-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Footer Info */}
            <div className="mt-auto pt-6 border-t border-gray-100 text-center shrink-0">
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-[0.1em] mb-1">
                <Truck size={12} />
                <span>Islandwide COD Delivery</span>
              </div>
              <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">
                Comfalo Clothing Brand • Sri Lanka
              </p>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
