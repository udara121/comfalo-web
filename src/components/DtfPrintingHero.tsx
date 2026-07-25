import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Palette, Clock, PenTool, MessageCircle, ArrowRight, Globe, ShieldCheck, HeadphoneOff, Truck, Headphones } from 'lucide-react';

export default function DtfPrintingHero() {
  const { navigateTo } = useApp();

  const handleWhatsappClick = () => {
    const message = encodeURIComponent("Hi Comfalo Clothing! I would like to inquire about DTF T-Shirt printing for my custom order.");
    window.open(`https://wa.me/94753237633?text=${message}`, '_blank');
  };

  return (
    <section className="relative w-full overflow-hidden bg-white text-gray-900 border-b border-gray-200" id="dtf-printing-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        
        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 space-y-6 z-20 animate-fadeIn">
            
            {/* Top Subheading Tagline */}
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-black tracking-[0.25em] text-orange-600 uppercase">
                WE PRINT YOUR VISION
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[0.95] uppercase font-sans">
                DTF T SHIRT
              </h1>
              <div className="pt-2">
                <span className="inline-block bg-[#111111] text-white text-3xl sm:text-5xl lg:text-6xl font-black italic tracking-wider px-6 py-2.5 rounded-sm shadow-xl transform -rotate-1 border-b-4 border-orange-500 animate-pulse">
                  PRINTING
                </span>
              </div>
            </div>

            {/* Description Text */}
            <p className="text-sm md:text-base text-gray-600 font-sans tracking-wide leading-relaxed max-w-xl">
              High quality prints, vibrant colors and fast turnaround for every order.
            </p>

            {/* Feature Icons Grid (4 Items) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-orange-500/40 hover:shadow-xs transition-all">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2 shadow-xs">
                  <Printer size={20} />
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase text-gray-800 leading-tight">HIGH QUALITY PRINTS</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-orange-500/40 hover:shadow-xs transition-all">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2 shadow-xs">
                  <Palette size={20} />
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase text-gray-800 leading-tight">VIBRANT COLORS</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-orange-500/40 hover:shadow-xs transition-all">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2 shadow-xs">
                  <Clock size={20} />
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase text-gray-800 leading-tight">FAST TURNAROUND</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-orange-500/40 hover:shadow-xs transition-all">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2 shadow-xs">
                  <PenTool size={20} />
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase text-gray-800 leading-tight">CUSTOM DESIGNS</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              {/* WhatsApp Call / Order Button */}
              <button
                onClick={handleWhatsappClick}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs md:text-sm tracking-wider px-6 py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-3 cursor-pointer transform hover:-translate-y-0.5"
              >
                <div className="w-6 h-6 rounded-full bg-white text-orange-600 flex items-center justify-center">
                  <MessageCircle size={14} className="fill-current" />
                </div>
                <span>0753237633</span>
              </button>

              {/* Order Now Button */}
              <button
                onClick={() => navigateTo('/shop')}
                className="border-2 border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] font-black text-xs md:text-sm tracking-wider px-7 py-3.5 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>ORDER NOW</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

          {/* RIGHT SHOWCASE COLUMN WITH FLOATING BADGE */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Image Container */}
            <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-100 group">
              <img
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&auto=format&fit=crop&q=80"
                alt="Comfalo Custom DTF Apparel Printing"
                className="w-full h-[380px] sm:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>

            {/* FLOATING HEAT-PRESS BADGE (SMALL POP) */}
            <div className="absolute -top-4 right-2 sm:right-6 z-30 bg-[#111111] border-2 border-orange-500 rounded-xl p-3.5 sm:p-4 shadow-2xl animate-floatBadge animate-popIn text-center transform hover:scale-105 transition-transform">
              <span className="block text-[10px] font-black tracking-widest text-gray-300 uppercase">PROFESSIONAL</span>
              <span className="block text-base sm:text-lg font-black text-orange-500 uppercase tracking-wider my-0.5 animate-pulse">HEAT PRESS</span>
              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">PERFECT RESULTS</span>
              <span className="block text-[9px] font-extrabold text-white uppercase tracking-widest mt-1 bg-orange-600/40 py-0.5 px-2 rounded">EVERY TIME!</span>
            </div>

          </div>

        </div>

        {/* BOTTOM FEATURE BAR (BLACK PILL BAR) */}
        <div className="mt-10 bg-[#111111] text-white rounded-full py-4 px-6 md:px-10 shadow-xl border border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center text-center divide-x divide-gray-800/80">
            
            <div className="flex items-center justify-center gap-2 px-2">
              <Globe size={16} className="text-orange-500 shrink-0" />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase font-mono">www.comfalo.lk</span>
            </div>

            <div className="flex items-center justify-center gap-2 px-2">
              <ShieldCheck size={16} className="text-orange-500 shrink-0" />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase font-mono">PREMIUM QUALITY</span>
            </div>

            <div className="flex items-center justify-center gap-2 px-2">
              <Headphones size={16} className="text-orange-500 shrink-0" />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase font-mono">CUSTOMER SUPPORT</span>
            </div>

            <div className="flex items-center justify-center gap-2 px-2">
              <Truck size={16} className="text-orange-500 shrink-0" />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase font-mono">FAST DELIVERY</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
