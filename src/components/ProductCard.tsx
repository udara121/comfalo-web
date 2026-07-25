import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  key?: React.Key | string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { navigateTo } = useApp();
  const [hovered, setHovered] = useState(false);

  const formattedPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const hasDiscount = product.salePrice !== null && product.salePrice !== undefined;
  const currentPrice = hasDiscount ? product.salePrice! : product.price;

  // Calculate discount percentage
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100) 
    : 0;

  // Use second image from gallery for hover if available
  const hoverImage = product.galleryImages && product.galleryImages.length > 1 
    ? product.galleryImages[1] 
    : product.mainImage;

  return (
    <div
      onClick={() => navigateTo(`/product/${product.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col h-full bg-[#FAFAFA] border border-gray-100 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
      id={`product-card-${product.id}`}
    >
      {/* Visual Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={hovered ? hoverImage : product.mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
        />

        {/* Action button overlays */}
        {product.stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase border border-white px-3 py-1.5">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Labels badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {hasDiscount && (
            <span className="bg-[#FF6B00] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase">
              {discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#111111] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase">
              NEW DROP
            </span>
          )}
          {product.featured && !hasDiscount && (
            <span className="bg-amber-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase">
              POPULAR
            </span>
          )}
        </div>

        {/* Color swatches displayed on bottom of photo when hovered */}
        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {product.colors.map((color, i) => (
              <span
                key={i}
                className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info container */}
      <div className="flex flex-col flex-grow p-4 bg-white border-t border-gray-50">
        {/* SKU or mini tag */}
        <span className="font-mono text-[9px] text-gray-400 tracking-wider mb-1 uppercase">
          {product.sku}
        </span>

        {/* Name */}
        <h3 className="font-sans font-medium text-xs md:text-sm text-gray-900 tracking-wide line-clamp-1 group-hover:text-[#FF6B00] transition-colors mb-2 uppercase">
          {product.name}
        </h3>

        {/* Price list */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-sm font-semibold text-gray-900 tracking-wide">
            {formattedPrice(currentPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through tracking-wide">
              {formattedPrice(product.price)}
            </span>
          )}
        </div>

        {/* Size chips shown in micro sizing */}
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 tracking-widest font-mono uppercase">
            SIZES: {product.sizes.join(' ')}
          </span>
          
          <span className="text-[11px] text-[#111111] font-semibold tracking-wider group-hover:translate-x-1 transition-transform flex items-center gap-1 uppercase">
            VIEW <span className="text-gray-400 font-normal">→</span>
          </span>
        </div>
      </div>
    </div>
  );
}
