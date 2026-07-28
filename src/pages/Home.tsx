import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Product, Banner } from '../types';
import { supabase } from '../lib/supabase';
import { INITIAL_PRODUCTS, INITIAL_BANNERS } from '../data/initialData';
import { ChevronLeft, ChevronRight, ArrowRight, Truck, PhoneCall, RotateCcw, ShieldCheck, Printer, Palette, Clock, PenTool, MessageCircle, Globe, Headphones } from 'lucide-react';

export default function Home() {
  const { navigateTo, categories } = useApp();
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let loadedBanners: Banner[] = [];
        let loadedProducts: Product[] = [];

        // 1. Try Local API Banners
        try {
          const bannersRes = await fetch('/api/banners');
          if (bannersRes.ok) {
            loadedBanners = await bannersRes.json();
          }
        } catch (e) {
          console.warn('API /api/banners unavailable, falling back to Supabase Cloud');
        }

        // Supabase Direct Banners Fallback if API returned empty/failed
        if (!loadedBanners || loadedBanners.length === 0) {
          try {
            const { data: bData } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
            if (bData && bData.length > 0) {
              loadedBanners = bData.map((b: any) => ({
                id: String(b.id),
                title: b.title || 'STREET ACCENTS DTF PRINTING',
                subtitle: b.subtitle || 'PROFESSIONAL HEAT PRESS. PERFECT RESULTS EVERY TIME!',
                image: b.image || 'https://kpjwjkqxyfhkyzfiadqs.supabase.co/storage/v1/object/public/banners/hero-bg.png',
                linkUrl: b.link_url || b.linkUrl || b.link || '/shop',
                buttonText: b.button_text || b.buttonText || 'Shop Now',
                sortOrder: b.sort_order || b.sortOrder || 1,
                status: b.status || 'active',
                createdAt: b.created_at || b.createdAt || new Date().toISOString()
              }));
            }
          } catch (sbErr) {
            console.error('Supabase banner query failed:', sbErr);
          }
        }

        // Default Fallback Banner if DB is empty
        if (!loadedBanners || loadedBanners.length === 0) {
          loadedBanners = [{
            id: '1',
            title: 'STREET ACCENTS DTF PRINTING',
            subtitle: 'PROFESSIONAL HEAT PRESS. PERFECT RESULTS EVERY TIME!',
            image: 'https://kpjwjkqxyfhkyzfiadqs.supabase.co/storage/v1/object/public/banners/hero-bg.png',
            linkUrl: '/shop',
            buttonText: 'EXPLORE COLLECTION',
            sortOrder: 1,
            status: 'active',
            createdAt: new Date().toISOString()
          }];
        }
        setBanners(loadedBanners);

        // 2. Try Local API Products
        try {
          const productsRes = await fetch('/api/products');
          if (productsRes.ok) {
            loadedProducts = await productsRes.json();
          }
        } catch (e) {
          console.warn('API /api/products unavailable, falling back to Supabase Cloud');
        }

        // Supabase Direct Products Fallback if API returned empty/failed
        if (!loadedProducts || loadedProducts.length === 0) {
          try {
            const { data: pData } = await supabase.from('products').select('*');
            if (pData && pData.length > 0) {
              loadedProducts = pData.map((p: any) => ({
                id: String(p.id),
                categoryId: String(p.category_id || p.categoryId || '1'),
                name: p.name,
                slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
                sku: p.sku || `SKU-${p.id}`,
                description: p.description || '',
                price: Number(p.price),
                salePrice: p.sale_price ? Number(p.sale_price) : (p.original_price ? Number(p.original_price) : undefined),
                sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL', '2XL'],
                colors: Array.isArray(p.colors) ? p.colors : [{ name: 'Black', hex: '#111' }, { name: 'White', hex: '#fff' }],
                stockQuantity: p.stock_quantity ?? p.stockQuantity ?? 10,
                mainImage: p.main_image || p.mainImage || (Array.isArray(p.images) ? p.images[0] : p.image) || '',
                galleryImages: Array.isArray(p.gallery_images) ? p.gallery_images : (Array.isArray(p.images) ? p.images : []),
                featured: p.featured ?? false,
                isNewArrival: p.is_new_arrival ?? p.isNewArrival ?? false,
                views: p.views || 0,
                status: p.status || 'active',
                createdAt: p.created_at || p.createdAt || new Date().toISOString()
              }));
            }
          } catch (sbErr) {
            console.error('Supabase product query failed:', sbErr);
          }
        }

        if (!loadedProducts || loadedProducts.length === 0) {
          loadedProducts = INITIAL_PRODUCTS;
        }

        const activeProds = loadedProducts.filter(p => p.status === 'active');
        const featured = activeProds.filter(p => p.featured);
        const newProds = activeProds.filter(p => p.isNewArrival);

        setFeaturedProducts(featured.length > 0 ? featured.slice(0, 4) : activeProds.slice(0, 4));
        setNewArrivals(newProds.length > 0 ? newProds.slice(0, 4) : activeProds.slice(0, 4));
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Automatic banner slideshow
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const handlePrevSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handleWhatsappClick = () => {
    const message = encodeURIComponent("Hi Comfalo Clothing! I would like to inquire about DTF T-Shirt printing for my custom order.");
    window.open(`https://wa.me/94753237633?text=${message}`, '_blank');
  };

  const instagramImages = [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
  ];

  return (
    <div className="bg-[#FAFAFA]" id="comfalo-home-page">
      {/* 1. Hero Slideshow Banner (Framed to show FULL Image) */}
      <section className="relative w-full h-[65vh] sm:h-[78vh] md:h-[85vh] lg:h-[88vh] min-h-[520px] max-h-[860px] overflow-hidden bg-gray-900" id="hero-slider">
        {banners.map((banner, index) => {
            const isDtfSlide = banner.title.toUpperCase().includes('STREET ACCENTS') ||
              banner.title.toUpperCase().includes('PRINTING') ||
              banner.title.toUpperCase().includes('DTF');

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                {/* Background image & gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30 z-10" />
                {/* Ambient glowing particles & mesh pattern on left side */}
                <div className="absolute inset-0 bg-hero-grid opacity-25 z-10 pointer-events-none" />
                <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl z-10 animate-floatParticle pointer-events-none" />
                <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl z-10 animate-floatParticle pointer-events-none" style={{ animationDelay: '2s' }} />

                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover object-[center_5%] filter brightness-[1.02] contrast-[1.05] animate-mobilePan sm:animate-none"
                  referrerPolicy="no-referrer"
                />

                {/* --- CUSTOM DTF PRINTING SLIDE OVERLAY (For STREET ACCENTS / DTF Banners) --- */}
                {isDtfSlide ? (
                  <div className="absolute inset-0 z-20 flex flex-col justify-between px-4 sm:px-8 md:px-16 py-8 text-white max-w-7xl mx-auto">
                    <div className="my-auto space-y-5 max-w-md lg:max-w-xl py-4">
                      
                      {/* Subheading Tagline */}
                      <div className="flex items-center gap-2 animate-fadeIn">
                        <div className="w-8 h-0.5 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black tracking-[0.3em] text-orange-400 uppercase">
                          WE PRINT YOUR VISION
                        </span>
                      </div>

                      {/* Main Headline (Tight Crisp Typography) */}
                      <div className="space-y-1.5 animate-slideUp">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none uppercase font-sans drop-shadow-md">
                          PREMIUM DTF
                        </h1>
                        <div className="relative inline-block pt-1">
                          <span className="relative z-10 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wider text-orange-500 uppercase drop-shadow-lg">
                            PRINTING SERVICES
                          </span>
                          <div className="absolute -bottom-1 left-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full animate-inkSpread shadow-lg shadow-orange-500/50" />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-200 tracking-wide font-sans leading-relaxed max-w-lg animate-fadeIn">
                        High quality prints, vibrant colors and fast turnaround for every order.
                      </p>

                      {/* Feature Icons Row (4 Items with Hover Lift & Glow) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 max-w-xl animate-fadeIn">
                        <div className="flex items-center gap-2 p-2 bg-black/50 backdrop-blur-md border border-white/15 rounded-xl hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300 group">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <Printer size={16} />
                          </div>
                          <span className="text-[9px] font-black tracking-wider uppercase text-gray-100 leading-tight">HIGH QUALITY PRINTS</span>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-black/50 backdrop-blur-md border border-white/15 rounded-xl hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300 group">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <Palette size={16} />
                          </div>
                          <span className="text-[9px] font-black tracking-wider uppercase text-gray-100 leading-tight">VIBRANT COLORS</span>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-black/50 backdrop-blur-md border border-white/15 rounded-xl hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300 group">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <Clock size={16} />
                          </div>
                          <span className="text-[9px] font-black tracking-wider uppercase text-gray-100 leading-tight">FAST TURNAROUND</span>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-black/50 backdrop-blur-md border border-white/15 rounded-xl hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300 group">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <PenTool size={16} />
                          </div>
                          <span className="text-[9px] font-black tracking-wider uppercase text-gray-100 leading-tight">CUSTOM DESIGNS</span>
                        </div>
                      </div>

                      {/* CTA Action Buttons with Hover Transitions */}
                      <div className="flex flex-wrap items-center gap-3.5 pt-2">
                        <button
                          onClick={handleWhatsappClick}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs md:text-sm tracking-wider px-6 py-3 rounded-full transition-all duration-300 shadow-xl hover:shadow-orange-500/40 flex items-center gap-2.5 cursor-pointer transform hover:scale-105 ring-4 ring-orange-500/30 group"
                        >
                          <div className="w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageCircle size={13} className="fill-current animate-pulse" />
                          </div>
                          <span>0753237633</span>
                        </button>

                        <button
                          onClick={() => navigateTo(banner.linkUrl || '/shop')}
                          className="border-2 border-white/80 bg-white/10 hover:border-orange-500 hover:bg-orange-500 hover:text-white text-white font-black text-xs md:text-sm tracking-wider px-7 py-3 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer backdrop-blur-md group hover:shadow-lg hover:shadow-orange-500/20"
                        >
                          <span>ORDER NOW</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                        </button>
                      </div>

                    </div>

                    {/* FLOATING HEAT PRESS GLASS BADGE (Desktop Only - Hidden on Mobile) */}
                    <div className="hidden sm:block absolute top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:top-[15%] right-auto sm:right-6 md:right-8 lg:right-10 z-30 bg-[#111111]/90 backdrop-blur-xl border-2 rounded-2xl p-3 sm:p-4 md:p-5 shadow-2xl animate-continuousPop text-center min-w-[170px] sm:min-w-[210px] md:min-w-[240px] pointer-events-auto hover:scale-110 transition-transform">
                      <span className="block text-[10px] sm:text-xs font-black tracking-[0.2em] text-gray-300 uppercase">PROFESSIONAL</span>
                      <span className="block text-lg sm:text-xl md:text-2xl font-black text-orange-500 uppercase tracking-wider my-0.5 animate-pulse drop-shadow-md">HEAT PRESS</span>
                      <span className="block text-[9px] sm:text-[10px] font-bold text-gray-200 uppercase tracking-widest leading-tight">PERFECT RESULTS</span>
                      <span className="block text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest mt-1.5 bg-gradient-to-r from-orange-600 to-amber-500 py-1 px-3 rounded-md shadow-md">EVERY TIME!</span>
                    </div>

                    {/* PERFECTLY CENTERED BOTTOM BAR WITH MICRO-ANIMATED ICONS */}
                    <div className="hidden sm:block absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-5xl bg-[#111111]/95 backdrop-blur-md text-white rounded-full py-3 px-6 md:px-8 border-2 border-white/20 shadow-2xl">
                      <div className="grid grid-cols-4 gap-2 items-center text-center divide-x divide-white/20">
                        <div className="flex items-center justify-center gap-1.5 px-1 group cursor-pointer">
                          <Globe size={16} className="text-orange-500 shrink-0 group-hover:rotate-180 transition-transform duration-500" />
                          <span className="text-[10px] md:text-xs font-black tracking-widest uppercase font-mono group-hover:text-orange-400 transition-colors">www.comfalo.lk</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 px-1 group cursor-pointer">
                          <ShieldCheck size={16} className="text-orange-500 shrink-0 group-hover:scale-125 transition-transform duration-300" />
                          <span className="text-[10px] md:text-xs font-black tracking-widest uppercase font-mono group-hover:text-orange-400 transition-colors">PREMIUM QUALITY</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 px-1 group cursor-pointer">
                          <Headphones size={16} className="text-orange-500 shrink-0 group-hover:animate-bounce" />
                          <span className="text-[10px] md:text-xs font-black tracking-widest uppercase font-mono group-hover:text-orange-400 transition-colors">CUSTOMER SUPPORT</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 px-1 group cursor-pointer">
                          <Truck size={16} className="text-orange-500 shrink-0 group-hover:translate-x-2 transition-transform duration-300" />
                          <span className="text-[10px] md:text-xs font-black tracking-widest uppercase font-mono group-hover:text-orange-400 transition-colors">FAST DELIVERY</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* --- STANDARD HERO SLIDE CONTENT --- */
                  <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-6 sm:px-12 md:px-24 text-white max-w-4xl">
                    <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#FF6B00] mb-3 uppercase animate-fadeIn">
                      COMFALO CLOTHING CO.
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.08em] leading-tight mb-4 uppercase animate-slideUp">
                      {banner.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-200 tracking-wider font-sans leading-relaxed mb-8 uppercase max-w-2xl animate-fadeIn">
                      {banner.subtitle}
                    </p>
                    <button
                      onClick={() => navigateTo(banner.linkUrl)}
                      className="bg-white hover:bg-[#FF6B00] hover:text-white text-[#111111] text-[10px] md:text-xs font-semibold tracking-[0.25em] px-8 py-4 uppercase rounded-none transition-all duration-300 transform hover:scale-[1.03] shadow-md cursor-pointer flex items-center gap-2"
                    >
                      {banner.buttonText}
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        }

        {/* Carousel Slide controls (Hidden per user request) */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-none transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[#FF6B00]' : 'bg-white/40'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. Announcement Promo Info Grid - 4 Columns Horizontal on Mobile & PC */}
      <section className="bg-white py-3 sm:py-6 border-b border-gray-100" id="announcements-grid">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 grid grid-cols-4 gap-1 sm:gap-4 md:gap-6 text-center divide-x divide-gray-200/60">
          <div className="py-1 px-0.5 sm:px-2 flex flex-col items-center justify-center">
            <Truck className="text-[#FF6B00] mb-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-tight sm:tracking-widest uppercase text-gray-900 leading-tight">
              Islandwide Delivery
            </span>
            <span className="hidden sm:block text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
              Cash on delivery in 2-4 days
            </span>
          </div>
          <div className="py-1 px-0.5 sm:px-2 flex flex-col items-center justify-center">
            <RotateCcw className="text-[#FF6B00] mb-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-tight sm:tracking-widest uppercase text-gray-900 leading-tight">
              7-Day Exchanges
            </span>
            <span className="hidden sm:block text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
              Hassle-free size swaps
            </span>
          </div>
          <div className="py-1 px-0.5 sm:px-2 flex flex-col items-center justify-center">
            <ShieldCheck className="text-[#FF6B00] mb-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-tight sm:tracking-widest uppercase text-gray-900 leading-tight">
              Heavyweight Cotton
            </span>
            <span className="hidden sm:block text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
              Tailored comfort structures
            </span>
          </div>
          <div className="py-1 px-0.5 sm:px-2 flex flex-col items-center justify-center">
            <PhoneCall className="text-[#FF6B00] mb-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-tight sm:tracking-widest uppercase text-gray-900 leading-tight">
              WhatsApp Order
            </span>
            <span className="hidden sm:block text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
              Quick cart checkout
            </span>
          </div>
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="home-categories">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#FF6B00] mb-2">
            CATEGORIES
          </h2>
          <p className="text-xl md:text-2xl font-bold uppercase tracking-wider text-gray-900">
            SHOP COMFALO SILHOUETTES
          </p>
          <div className="w-12 h-1 bg-[#111111] mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.filter(c => ['men', 'women', 'unisex', 'accessories'].includes(c.slug)).map((category) => {
            // Unsplash visual placeholders matching streetwear
            const categoryImages: Record<string, string> = {
              men: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80',
              women: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
              unisex: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
              accessories: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?w=600&q=80'
            };

            const bgImage = categoryImages[category.slug] || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80';

            return (
              <div
                key={category.id}
                onClick={() => navigateTo(`/shop?category=${category.slug}`)}
                className="relative h-96 group overflow-hidden cursor-pointer border border-gray-100 shadow-sm"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-black/40 z-10 transition-colors duration-300 group-hover:bg-black/55" />
                <img
                  src={bgImage}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Info Text */}
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-lg font-bold tracking-[0.2em] uppercase mb-1.5">
                    {category.name}
                  </h3>
                  <p className="text-[10px] text-gray-300 uppercase tracking-wide leading-relaxed line-clamp-2 mb-4">
                    {category.description}
                  </p>
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase border-b border-white pb-1 w-fit group-hover:text-[#FF6B00] group-hover:border-[#FF6B00] transition-colors">
                    EXPLORE NOW
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Drop Section */}
      <section className="bg-white py-16 border-y border-gray-100" id="featured-products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="text-center md:text-left">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#FF6B00] mb-2">
                CURATED
              </h2>
              <p className="text-xl md:text-2xl font-bold uppercase tracking-wider text-gray-900">
                FEATURED STREET SILHOUETTES
              </p>
            </div>
            <button
              onClick={() => navigateTo('/shop')}
              className="mt-4 md:mt-0 text-[10px] font-bold tracking-[0.2em] uppercase border-b border-gray-900 pb-1.5 text-gray-900 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              VIEW ALL PRODUCTS <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse flex flex-col h-[400px]">
                  <div className="bg-gray-100 flex-grow aspect-[3/4]"></div>
                  <div className="h-4 bg-gray-100 mt-4 w-3/4"></div>
                  <div className="h-4 bg-gray-100 mt-2 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 text-xs font-mono text-gray-400 uppercase tracking-widest">
              No products found. Add products in Admin Panel to populate.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Big Promo Banner Block */}
      <section className="relative h-[45vh] md:h-[55vh] overflow-hidden bg-gray-900" id="new-drop-banner">
        <div className="absolute inset-0 bg-black/55 z-10" />
        <img
          src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1600&q=80"
          alt="Streetwear Banner"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4 text-white">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#FF6B00] uppercase mb-3">
            LIMITED RELEASES
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.1em] uppercase mb-4 max-w-3xl leading-tight">
            HEAVYWEIGHT ZIP-UPS & LUXURY CARGOS
          </h2>
          <p className="text-xs text-gray-300 tracking-wider uppercase max-w-xl mb-8 leading-relaxed font-sans">
            Tailored to fit standard boxy street aesthetics. Made of double-needled heavy interlocking textiles that retain colors and shapes over repetitive washes.
          </p>
          <button
            onClick={() => navigateTo('/shop?category=new-arrivals')}
            className="bg-white hover:bg-[#FF6B00] hover:text-white text-[#111111] text-[10px] font-semibold tracking-[0.25em] px-8 py-4 uppercase transition-all cursor-pointer flex items-center gap-2"
          >
            DISCOVER NEW DROP
            <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* 6. New Arrivals Drop Grid */}
      <section className="bg-[#FAFAFA] py-16" id="new-arrivals">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="text-center md:text-left">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#FF6B00] mb-2">
                NEW RELEASE
              </h2>
              <p className="text-xl md:text-2xl font-bold uppercase tracking-wider text-gray-900">
                THE LATEST DESIGNS
              </p>
            </div>
            <button
              onClick={() => navigateTo('/shop?category=new-arrivals')}
              className="mt-4 md:mt-0 text-[10px] font-bold tracking-[0.2em] uppercase border-b border-gray-900 pb-1.5 text-gray-900 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              SHOP ALL DROPS <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse flex flex-col h-[400px]">
                  <div className="bg-gray-100 flex-grow aspect-[3/4]"></div>
                  <div className="h-4 bg-gray-100 mt-4 w-3/4"></div>
                  <div className="h-4 bg-gray-100 mt-2 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-12 text-xs font-mono text-gray-400 uppercase tracking-widest">
              No new arrivals found. Add new products in Admin Panel.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Instagram Street Photography Strip */}
      <section className="bg-white border-t border-gray-100 pt-16 pb-8" id="social-strip">
        <div className="text-center mb-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#FF6B00] mb-2">
            COMMUNITY
          </h2>
          <p className="text-xl font-bold uppercase tracking-widest text-gray-900">
            WEAR IT YOUR WAY #COMFALO
          </p>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
            Tag us on Instagram to get featured on our feed
          </span>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 px-2">
          {instagramImages.map((src, idx) => (
            <div key={idx} className="aspect-square bg-gray-100 overflow-hidden relative group">
              <img
                src={src}
                alt={`Instagram look ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold tracking-widest uppercase pointer-events-none">
                VIEW STYLE
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
