import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, ChevronRight, MessageSquare, PhoneCall, ShieldCheck, HelpCircle, Truck, RefreshCw } from 'lucide-react';

export default function ProductDetail() {
  const { currentPath, addToCart, navigateTo, settings } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'care'>('details');

  // Error validations
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  // Extract slug/ID from url hash (e.g. #/product/heavyweight-signature-oversized-tee)
  const getSlugFromHash = () => {
    const parts = currentPath.split('/');
    return parts[parts.length - 1];
  };

  const productSlug = getSlugFromHash();

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productSlug) return;
      try {
        setLoading(true);
        let foundProduct: Product | null = null;

        try {
          const res = await fetch(`/api/products/${productSlug}`);
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            foundProduct = await res.json() as Product;
          }
        } catch (apiErr) {
          console.warn('API product detail fetch error:', apiErr);
        }

        // Fallback to INITIAL_PRODUCTS if API didn't find product
        if (!foundProduct) {
          foundProduct = INITIAL_PRODUCTS.find(p => p.slug === productSlug || p.id === productSlug || p.slug.includes(productSlug)) || null;
        }

        if (foundProduct) {
          setProduct(foundProduct);
          setActiveImage(foundProduct.mainImage);

          if (foundProduct.colors && foundProduct.colors.length > 0) {
            setSelectedColor(foundProduct.colors[0]);
          }
          setSelectedSize('');
          setQuantity(1);
          setSizeError(false);
          setColorError(false);

          // Fetch related products
          try {
            const productsRes = await fetch(`/api/products?category=${foundProduct.categoryId}`);
            if (productsRes.ok && productsRes.headers.get('content-type')?.includes('application/json')) {
              const list = await productsRes.json() as Product[];
              if (Array.isArray(list) && list.length > 0) {
                setRelatedProducts(list.filter(p => p.id !== foundProduct?.id).slice(0, 4));
              } else {
                setRelatedProducts(INITIAL_PRODUCTS.filter(p => p.id !== foundProduct?.id).slice(0, 4));
              }
            } else {
              setRelatedProducts(INITIAL_PRODUCTS.filter(p => p.id !== foundProduct?.id).slice(0, 4));
            }
          } catch (relErr) {
            setRelatedProducts(INITIAL_PRODUCTS.filter(p => p.id !== foundProduct?.id).slice(0, 4));
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs tracking-widest uppercase">
        LOADING SILHOUETTE SPECIFICATIONS...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-[#FAFAFA]" id="comfalo-product-not-found">
        <span className="text-5xl mb-4 block">☹</span>
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 mb-2">
          SILHOUETTE NOT FOUND
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">
          The streetwear design you are looking for does not exist or has been archived.
        </p>
        <button
          onClick={() => navigateTo('/shop')}
          className="bg-[#111111] text-white text-[10px] font-semibold tracking-widest px-6 py-3 uppercase hover:bg-[#FF6B00] transition-colors"
        >
          BACK TO APPARELS SHOP
        </button>
      </div>
    );
  }

  const hasDiscount = product.salePrice !== null && product.salePrice !== undefined;
  const priceToDisplay = hasDiscount ? product.salePrice! : product.price;

  const formattedPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

  const handleAddToCart = () => {
    let hasError = false;
    if (!selectedSize) {
      setSizeError(true);
      hasError = true;
    } else {
      setSizeError(false);
    }

    if (!selectedColor) {
      setColorError(true);
      hasError = true;
    } else {
      setColorError(false);
    }

    if (hasError) return;

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      image: product.mainImage,
      size: selectedSize,
      color: selectedColor!.name,
      colorHex: selectedColor!.hex,
      quantity,
    });
  };

  // Generate WhatsApp ordering Link for this product directly
  const handleOrderViaWhatsApp = () => {
    let hasError = false;
    if (!selectedSize) {
      setSizeError(true);
      hasError = true;
    }
    if (!selectedColor) {
      setColorError(true);
      hasError = true;
    }
    if (hasError) return;

    const whatsappNum = settings?.whatsappNumber || '94753237633';
    const message = `Hi Comfalo! I would like to order this item:
- Product: ${product.name}
- SKU: ${product.sku}
- Selected Size: ${selectedSize}
- Selected Color: ${selectedColor!.name}
- Quantity: ${quantity}
- Price: ${formattedPrice(priceToDisplay * quantity)}
Please let me know how to proceed with delivery. Thanks!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNum}?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10" id="comfalo-product-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Header Nav */}
        <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-8">
          <button onClick={() => navigateTo('/')} className="hover:text-black">HOME</button>
          <ChevronRight size={10} />
          <button onClick={() => navigateTo('/shop')} className="hover:text-black">SHOP</button>
          <ChevronRight size={10} />
          <span className="text-[#111111] font-bold truncate max-w-[150px] md:max-w-xs">{product.name}</span>
        </div>

        {/* Product Specification grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-6 md:p-10 border border-gray-100 shadow-xs mb-16">
          
          {/* LEFT: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Large active photo */}
            <div className="bg-[#FAFAFA] aspect-[3/4] border border-gray-100 overflow-hidden relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              {product.stockQuantity <= 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xs font-bold tracking-widest border border-white px-4 py-2 uppercase">
                    OUT OF STOCK
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel strip */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.galleryImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`aspect-square bg-[#FAFAFA] border overflow-hidden cursor-pointer ${
                      activeImage === imgUrl ? 'border-black ring-1 ring-black' : 'border-gray-200'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Spec details and actions */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase block mb-1">
                  SKU: {product.sku}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-gray-900 uppercase">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xl font-bold tracking-tight text-gray-900">
                    {formattedPrice(priceToDisplay)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through tracking-wide">
                      {formattedPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-[#111111] uppercase">
                    Select Size
                  </span>
                  <button
                    onClick={() => setActiveTab('fabric')}
                    className="text-[9px] text-[#FF6B00] font-bold tracking-wider hover:underline uppercase"
                  >
                    Sizing Guide
                  </button>
                </div>
                
                {sizeError && (
                  <span className="text-[10px] text-red-500 font-bold tracking-wider block mb-2 uppercase">
                    ⚠ Please select a size option
                  </span>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      disabled={product.stockQuantity <= 0}
                      onClick={() => {
                        setSelectedSize(sz);
                        setSizeError(false);
                      }}
                      className={`border text-[11px] font-mono font-bold w-12 h-12 flex items-center justify-center transition-colors cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[#111111] text-white border-black'
                          : 'border-gray-200 text-gray-700 hover:border-black disabled:opacity-40 disabled:pointer-events-none'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatch Selector */}
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#111111] uppercase block mb-2">
                  Color Options: <span className="text-gray-400 font-normal">{selectedColor?.name}</span>
                </span>
                {colorError && (
                  <span className="text-[10px] text-red-500 font-bold tracking-wider block mb-2 uppercase">
                    ⚠ Please select a color option
                  </span>
                )}
                <div className="flex gap-3">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      disabled={product.stockQuantity <= 0}
                      onClick={() => {
                        setSelectedColor(color);
                        setColorError(false);
                      }}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                        selectedColor?.name === color.name ? 'ring-2 ring-black ring-offset-2' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <span className={`w-1.5 h-1.5 rounded-full ${color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fafafa' ? 'bg-black' : 'bg-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Status Alerts & Qty selector */}
              <div className="flex items-center gap-6 border-y border-gray-100 py-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">AVAILABILITY</span>
                  {product.stockQuantity <= 0 ? (
                    <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest mt-1">OUT OF STOCK</span>
                  ) : product.stockQuantity < 5 ? (
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mt-1 animate-pulse">
                      ONLY {product.stockQuantity} PIECES REMAINING!
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest mt-1">IN STOCK</span>
                  )}
                </div>

                {product.stockQuantity > 0 && (
                  <div className="flex flex-col ml-auto">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">QUANTITY</span>
                    <div className="flex items-center border border-gray-200">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 hover:bg-gray-50 text-gray-500"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-xs font-mono font-bold text-[#111111]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        className="px-3 py-1.5 hover:bg-gray-50 text-gray-500"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Add to Cart & WhatsApp Order */}
              <div className="space-y-3.5 pt-2">
                <button
                  disabled={product.stockQuantity <= 0}
                  onClick={handleAddToCart}
                  className="w-full bg-[#111111] hover:bg-[#FF6B00] disabled:bg-gray-200 disabled:text-gray-400 text-white text-[11px] font-semibold tracking-[0.2em] py-4 uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag size={14} /> ADD TO SHOPPING CART
                </button>

                <button
                  disabled={product.stockQuantity <= 0}
                  onClick={handleOrderViaWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:bg-gray-100 disabled:text-gray-300 text-white text-[11px] font-semibold tracking-[0.2em] py-4 uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageSquare size={14} /> ORDER DIRECT VIA WHATSAPP
                </button>
              </div>

            </div>

            {/* LOWER Spec tabs: details, care, fabric */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer mr-6 ${
                    activeTab === 'details' ? 'border-b-2 border-black text-[#111111]' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  SPECIFICATIONS
                </button>
                <button
                  onClick={() => setActiveTab('fabric')}
                  className={`pb-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer mr-6 ${
                    activeTab === 'fabric' ? 'border-b-2 border-black text-[#111111]' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  FABRIC & SIZING
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`pb-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer ${
                    activeTab === 'care' ? 'border-b-2 border-black text-[#111111]' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  LAUNDRY CARE
                </button>
              </div>

              {/* Tab contents */}
              <div className="text-xs text-gray-600 uppercase tracking-wide leading-relaxed font-sans">
                {activeTab === 'details' && (
                  <p>{product.description}</p>
                )}
                {activeTab === 'fabric' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">FABRIC TEXTURE:</p>
                    <p>{product.fabricDetails || 'Premium heavy cotton fleece interlock composite. Built to stay boxy.'}</p>
                    <p className="font-semibold text-gray-800 mt-2">SIZING BLOCK:</p>
                    <p>Designed as an intentional oversized block. We suggest ordering your true standard size for the signature street drape, or sizing down once for a structured, closer fit.</p>
                  </div>
                )}
                {activeTab === 'care' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">PRESERVATION GUIDE:</p>
                    <p>{product.careInstructions || 'Wash machine cold inside-out. Iron low. No drying machines.'}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* RELATED DROPS SHELF */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="text-center md:text-left mb-10 border-b border-gray-100 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF6B00] mb-2">
                MATCHING PIECES
              </h2>
              <p className="text-lg font-bold uppercase tracking-wider text-gray-900">
                COMPLETE THE COMFALO FIT
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
