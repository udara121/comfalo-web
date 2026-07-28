import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';
import { SlidersHorizontal, ArrowRight, X, ChevronDown, Check } from 'lucide-react';

export default function Shop() {
  const { categories, currentPath, navigateTo } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // States for query and filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse parameters from window URL hash
  useEffect(() => {
    const parseUrlParams = () => {
      const hash = window.location.hash;
      const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
      const params = new URLSearchParams(queryStr);

      const catParam = params.get('category') || 'all';
      const searchParam = params.get('search') || '';
      
      setSelectedCategory(catParam);
      setSearchQuery(searchParam);
    };

    parseUrlParams();
    // Register event to handle route hash shifts
    window.addEventListener('hashchange', parseUrlParams);
    return () => window.removeEventListener('hashchange', parseUrlParams);
  }, []);

  // Fetch filtered products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/api/products?sort=${selectedSort}`;
        
        if (selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        if (selectedSize) {
          url += `&size=${selectedSize}`;
        }

        // Apply price range parameters
        if (selectedPriceRange === 'under-3k') {
          url += '&maxPrice=3000';
        } else if (selectedPriceRange === '3k-5k') {
          url += '&minPrice=3000&maxPrice=5000';
        } else if (selectedPriceRange === '5k-7.5k') {
          url += '&minPrice=5000&maxPrice=7500';
        } else if (selectedPriceRange === 'over-7.5k') {
          url += '&minPrice=7500';
        }

        const res = await fetch(url);
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, selectedSize, selectedPriceRange, selectedSort]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    // Sync to URL hash
    let path = '/shop';
    if (slug !== 'all') {
      path += `?category=${slug}`;
    }
    if (searchQuery) {
      path += `${slug !== 'all' ? '&' : '?'}search=${encodeURIComponent(searchQuery)}`;
    }
    navigateTo(path);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('');
    setSelectedPriceRange('');
    setSearchQuery('');
    setSelectedSort('newest');
    navigateTo('/shop');
  };

  const sizesOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

  const priceRanges = [
    { label: 'UNDER RS. 3,000', value: 'under-3k' },
    { label: 'RS. 3,000 – RS. 5,000', value: '3k-5k' },
    { label: 'RS. 5,000 – RS. 7,500', value: '5k-7.5k' },
    { label: 'OVER RS. 7,500', value: 'over-7.5k' },
  ];

  const sortOptions = [
    { label: 'NEWEST DROPS', value: 'newest' },
    { label: 'PRICE: LOW TO HIGH', value: 'price-low' },
    { label: 'PRICE: HIGH TO LOW', value: 'price-high' },
    { label: 'MOST POPULAR', value: 'popular' },
  ];

  const activeCategoryObject = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FAFAFA]" id="comfalo-shop-page">
      
      {/* Banner / Category Intro Title */}
      <div className="mb-10 text-center md:text-left">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#FF6B00] uppercase">
          COMFALO APPARELS
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111111] uppercase mt-1">
          {activeCategoryObject ? activeCategoryObject.name : searchQuery ? `Search Results: "${searchQuery}"` : 'SHOP ALL STYLES'}
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2 max-w-2xl leading-relaxed">
          {activeCategoryObject?.description || 'Browse our signature heavy combed cotton garments, oversized hoodies, utility cargos, and accessories built for high-contrast streetwear aesthetics.'}
        </p>
      </div>

      {/* Control bar: search, sorting trigger, mobile filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-gray-100 mb-8">
        {/* Search status summary */}
        <div className="text-xs font-mono tracking-widest text-gray-600 uppercase">
          {products.length} PRODUCTS FOUND
          {searchQuery && <span className="text-gray-400 font-sans ml-2">({searchQuery})</span>}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 relative">
            <span className="text-[10px] text-gray-400 tracking-wider font-semibold uppercase">SORT:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-none py-1.5 px-3 pr-8 text-[11px] tracking-wider uppercase font-medium focus:ring-1 focus:ring-black focus:border-black outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 bg-[#111111] hover:bg-[#FF6B00] text-white text-[10px] font-semibold tracking-widest px-4 py-2 uppercase transition-colors"
          >
            <SlidersHorizontal size={12} />
            FILTERS
          </button>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden md:block space-y-8 bg-white p-6 border border-gray-100 sticky top-28">
          
          {/* Categories Selector */}
          <div className="border-b border-gray-100 pb-6">
            <h3 className="text-xs font-bold tracking-[0.2em] text-[#111111] uppercase mb-4">
              COLLECTIONS
            </h3>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`text-xs text-left py-1 uppercase tracking-wider transition-colors ${
                  selectedCategory === 'all' ? 'text-[#FF6B00] font-bold' : 'text-gray-600 hover:text-black'
                }`}
              >
                All Apparel
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`text-xs text-left py-1 uppercase tracking-wider transition-colors ${
                    selectedCategory === cat.slug ? 'text-[#FF6B00] font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size filter chips */}
          <div className="border-b border-gray-100 pb-6">
            <h3 className="text-xs font-bold tracking-[0.2em] text-[#111111] uppercase mb-4">
              FILTER BY SIZE
            </h3>
            <div className="flex flex-wrap gap-2">
              {sizesOptions.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`border text-[10px] font-mono font-bold w-10 h-10 flex items-center justify-center transition-colors cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-[#111111] text-white border-black'
                      : 'border-gray-200 text-gray-700 hover:border-black'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border-b border-gray-100 pb-6">
            <h3 className="text-xs font-bold tracking-[0.2em] text-[#111111] uppercase mb-4">
              PRICE BOUNDS
            </h3>
            <div className="flex flex-col space-y-2">
              {priceRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedPriceRange(selectedPriceRange === range.value ? '' : range.value)}
                  className={`text-xs text-left py-1 uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    selectedPriceRange === range.value ? 'text-black font-semibold' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 border border-gray-300 flex items-center justify-center rounded-none bg-white`}>
                    {selectedPriceRange === range.value && <Check size={10} className="text-[#FF6B00]" />}
                  </span>
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters Trigger */}
          {(selectedCategory !== 'all' || selectedSize || selectedPriceRange || searchQuery) && (
            <button
              onClick={handleClearAllFilters}
              className="w-full bg-[#FF6B00] text-white text-[10px] font-semibold tracking-widest py-3 uppercase hover:bg-[#111111] transition-colors"
            >
              CLEAR ALL FILTERS
            </button>
          )}
        </aside>

        {/* PRODUCTS GRID CONTAINER */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse flex flex-col h-[400px]">
                  <div className="bg-gray-200 flex-grow aspect-[3/4]"></div>
                  <div className="h-4 bg-gray-200 mt-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 mt-2 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[40vh]">
              <span className="text-4xl text-gray-200 font-mono tracking-widest mb-4">☹</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 mb-2">
                NO SILHOUETTES MATCH YOUR CRITERIA
              </h2>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider max-w-sm mb-6 leading-relaxed">
                Try widening your price boundaries, changing your collections filter, or clearing the search keyword.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="bg-[#111111] text-white text-[10px] font-semibold tracking-[0.2em] px-6 py-3 uppercase hover:bg-[#FF6B00] transition-colors"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* --- MOBILE FILTERS OVERLAY PANEL --- */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden" id="mobile-filters-drawer">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl z-50 py-6 px-6 overflow-y-auto ml-auto">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-[#111111] flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> FILTER SELECTIONS
              </span>
              <button onClick={() => setShowMobileFilters(false)} className="text-[#111111] p-1">
                <X size={20} />
              </button>
            </div>

            {/* Mobile Collections list */}
            <div className="mb-6">
              <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#111111] uppercase mb-3">COLLECTIONS</h3>
              <div className="flex flex-col space-y-1.5">
                <button
                  onClick={() => {
                    handleCategorySelect('all');
                    setShowMobileFilters(false);
                  }}
                  className={`text-xs text-left py-1.5 uppercase tracking-wider border-b border-gray-50 ${
                    selectedCategory === 'all' ? 'text-[#FF6B00] font-bold' : 'text-gray-600'
                  }`}
                >
                  All Apparels
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategorySelect(cat.slug);
                      setShowMobileFilters(false);
                    }}
                    className={`text-xs text-left py-1.5 uppercase tracking-wider border-b border-gray-50 ${
                      selectedCategory === cat.slug ? 'text-[#FF6B00] font-bold' : 'text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile sizes selection */}
            <div className="mb-6">
              <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#111111] uppercase mb-3">SIZE CHIPS</h3>
              <div className="flex flex-wrap gap-1.5">
                {sizesOptions.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`border text-[9px] font-mono font-bold w-9 h-9 flex items-center justify-center transition-colors ${
                      selectedSize === sz
                        ? 'bg-[#111111] text-white border-black'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile price selections */}
            <div className="mb-8">
              <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#111111] uppercase mb-3">PRICES</h3>
              <div className="flex flex-col space-y-1.5">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setSelectedPriceRange(selectedPriceRange === range.value ? '' : range.value)}
                    className={`text-xs text-left py-1.5 uppercase tracking-wider flex items-center gap-2 ${
                      selectedPriceRange === range.value ? 'text-black font-semibold' : 'text-gray-500'
                    }`}
                  >
                    <span className={`w-3 h-3 border border-gray-300 flex items-center justify-center bg-white`}>
                      {selectedPriceRange === range.value && <span className="w-1.5 h-1.5 bg-[#FF6B00]"></span>}
                    </span>
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="mt-auto space-y-2.5">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-[#111111] text-white text-[10px] font-semibold tracking-widest py-3.5 uppercase"
              >
                APPLY SELECTIONS
              </button>
              <button
                onClick={() => {
                  handleClearAllFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full bg-transparent border border-gray-200 text-gray-600 text-[10px] font-semibold tracking-widest py-3.5 uppercase"
              >
                CLEAR ALL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
