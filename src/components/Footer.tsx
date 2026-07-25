import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import { Facebook, Instagram, Phone, Mail, MapPin, Send, ShieldCheck, CreditCard, RotateCcw } from 'lucide-react';

export default function Footer() {
  const { navigateTo, settings } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#111111] text-gray-300 pt-16 pb-8 border-t border-gray-900 font-sans tracking-wide" id="comfalo-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Value Proposition Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 mb-12 border-b border-gray-800 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-gray-800 text-[#FF6B00] rounded-full">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-[0.15em] mb-1">EASY RETURNS & EXCHANGE</h4>
              <p className="text-[11px] text-gray-400">Exchange within 7 days if the fit isn\'t perfect.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-gray-800 text-[#FF6B00] rounded-full">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-[0.15em] mb-1">WHATSAPP SUPPORT</h4>
              <p className="text-[11px] text-gray-400">Reach us on WhatsApp for rapid support on any orders.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-gray-800 text-[#FF6B00] rounded-full">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-[0.15em] mb-1">CASH ON DELIVERY (COD)</h4>
              <p className="text-[11px] text-gray-400">Pay safely in cash upon receiving your clothing parcel.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Logo size="md" variant="dark" className="!justify-start" />
            <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-[0.08em]">
              "Comfort. Style. You." <br />
              Premium modern clothing brand based in Sri Lanka, tailoring oversized comfort silhouettes for contemporary streetwear lovers.
            </p>
            {/* Social icons */}
            <div className="flex space-x-4 pt-2">
              <a href={settings?.facebookUrl || 'https://www.facebook.com/share/1G3Tfp6opm/?mibextid=wwXIfr'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href={settings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href={`https://wa.me/${settings?.whatsappNumber || '94753237633'}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="WhatsApp">
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Collections Quick Nav */}
          <div>
            <h3 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4">COLLECTIONS</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/shop?category=men')} className="hover:text-white transition-colors uppercase tracking-[0.1em]">Men\'s Streetwear</button>
              </li>
              <li>
                <button onClick={() => navigateTo('/shop?category=women')} className="hover:text-white transition-colors uppercase tracking-[0.1em]">Women\'s Streetwear</button>
              </li>
              <li>
                <button onClick={() => navigateTo('/shop?category=unisex')} className="hover:text-white transition-colors uppercase tracking-[0.1em]">Unisex Oversized Tees</button>
              </li>
              <li>
                <button onClick={() => navigateTo('/shop?category=accessories')} className="hover:text-white transition-colors uppercase tracking-[0.1em]">Premium Caps & Accs</button>
              </li>
              <li>
                <button onClick={() => navigateTo('/shop?category=sale')} className="text-[#FF6B00] font-semibold hover:text-white transition-colors uppercase tracking-[0.1em]">COMFALO SALE</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4">CUSTOMER CARE</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/track')} className="hover:text-white transition-colors uppercase tracking-[0.1em]">Track Shipment</button>
              </li>
              <li>
                <button onClick={() => navigateTo('/account')} className="hover:text-white transition-colors uppercase tracking-[0.1em]">My Account</button>
              </li>
              <li>
                <span className="text-gray-400 uppercase tracking-[0.1em]">Sri Lanka Delivery Note</span>
                <p className="text-[10px] text-gray-500 mt-1">2–4 working days islandwide. Cash on Delivery or Direct Bank Transfer available.</p>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4">NEWSLETTER</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed uppercase tracking-[0.08em]">
              Subscribe to unlock early access to our seasonal product drops and sales.
            </p>
            <form onSubmit={handleSubscribe} className="flex relative">
              <input
                type="email"
                placeholder="YOUR EMAIL..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-900 focus:bg-black text-xs text-white px-3 py-3 pr-10 border border-gray-800 focus:border-gray-600 outline-none w-full uppercase tracking-wider rounded-none"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-[#FF6B00] hover:text-white transition-colors">
                <Send size={16} />
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] text-green-400 mt-2 uppercase tracking-[0.05em]">Thanks for subscribing to Comfalo!</p>
            )}
          </div>
        </div>

        {/* Lower row: copyright & badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-800 items-center">
          <p className="text-[10px] text-gray-500 text-center md:text-left uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} COMFALO CLOTHING BRAND, SRI LANKA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex justify-center md:justify-end gap-3 text-gray-500 text-xs font-mono uppercase tracking-[0.1em]">
            <span className="border border-gray-800 px-2 py-1 text-[9px]">CASH ON DELIVERY</span>
            <span className="border border-gray-800 px-2 py-1 text-[9px]">BANK TRANSFER</span>
            <span className="border border-gray-800 px-2 py-1 text-[9px]">WHATSAPP ORDERING</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
