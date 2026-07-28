import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppWidget from './components/WhatsAppWidget';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import OrderTrack from './pages/OrderTrack';
import Account from './pages/Account';
import Admin from './pages/Admin';

import Logo from './components/Logo';

export default function App() {
  const { currentPath, loadingSettings } = useApp();

  // Simple, robust custom routing
  const renderPage = () => {
    if (loadingSettings) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FAFAFA] font-sans">
          <div className="animate-pulse flex flex-col items-center">
            <Logo size="lg" showText={true} />
            <div className="w-16 h-1 bg-gradient-to-r from-[#FF6B00] to-[#111111] rounded-full mt-6 animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mt-4">
              LOADING COMFALO...
            </span>
          </div>
        </div>
      );
    }

    // Match exact or starts-with paths
    if (currentPath === '/' || currentPath === '') {
      return <Home />;
    }
    
    if (currentPath.startsWith('/shop')) {
      return <Shop />;
    }
    
    if (currentPath.startsWith('/product/')) {
      return <ProductDetail />;
    }
    
    if (currentPath === '/checkout') {
      return <Checkout />;
    }
    
    if (currentPath === '/success') {
      return <Success />;
    }
    
    if (currentPath.startsWith('/track')) {
      return <OrderTrack />;
    }
    
    if (currentPath === '/account') {
      return <Account />;
    }
    
    if (currentPath === '/admin') {
      return <Admin />;
    }

    // Default Fallback
    return <Home />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]" id="comfalo-app-root">
      {/* Dynamic Navigation Bar Header */}
      <Header />

      {/* Primary Main Content Stage */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Global Interactive Drawer widgets */}
      <CartDrawer />
      <WhatsAppWidget />

      {/* Structural Footnotes & Details */}
      <Footer />
    </div>
  );
}
