import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    showCartDrawer,
    setShowCartDrawer,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    settings,
    navigateTo,
  } = useApp();

  if (!showCartDrawer) return null;

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 7500;
  const isFreeDelivery = cartSubtotal >= freeDeliveryThreshold;
  const amountNeededForFree = freeDeliveryThreshold - cartSubtotal;
  const progressPercent = Math.min((cartSubtotal / freeDeliveryThreshold) * 100, 100);

  const formattedPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

  const handleCheckoutClick = () => {
    setShowCartDrawer(false);
    navigateTo('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="comfalo-cart-drawer">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setShowCartDrawer(false)}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAFAFA] flex flex-col shadow-2xl h-full border-l border-gray-100">
          
          {/* Header */}
          <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-[#111111]" />
              <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-[#111111]">
                Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setShowCartDrawer(false)}
              className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer p-1"
            >
              <X size={22} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.length > 0 && (
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-col">
              <div className="flex justify-between items-center mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
                {isFreeDelivery ? (
                  <span className="text-green-600">⚡ YOU QUALIFY FOR FREE ISLANDWIDE DELIVERY!</span>
                ) : (
                  <span className="text-gray-600">
                    ADD <span className="text-[#FF6B00]">{formattedPrice(amountNeededForFree)}</span> MORE FOR FREE DELIVERY
                  </span>
                )}
                <span className="text-gray-400 font-mono">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-none overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-none ${
                    isFreeDelivery ? 'bg-green-500 animate-pulse' : 'bg-[#FF6B00]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* List of Cart Items */}
          <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag size={48} className="text-gray-300 mb-4 stroke-[1.2]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] mb-2">
                  YOUR CART IS EMPTY
                </h3>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider max-w-xs mb-6 leading-relaxed">
                  Fill your wardrobe with premium heavy cotton clothing and oversized aesthetics.
                </p>
                <button
                  onClick={() => {
                    setShowCartDrawer(false);
                    navigateTo('/shop');
                  }}
                  className="bg-[#111111] hover:bg-[#FF6B00] text-white text-[10px] font-semibold tracking-[0.2em] px-6 py-3 uppercase transition-colors"
                >
                  START BROWSING
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 p-4 bg-white border border-gray-100 relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-grow flex flex-col">
                    <span className="font-mono text-[8px] text-gray-400 tracking-wider uppercase mb-0.5">
                      {item.sku}
                    </span>
                    <h4
                      onClick={() => {
                        setShowCartDrawer(false);
                        navigateTo(`/product/${item.slug}`);
                      }}
                      className="text-xs font-semibold text-[#111111] tracking-wide line-clamp-1 uppercase cursor-pointer hover:text-[#FF6B00] transition-colors mb-1"
                    >
                      {item.name}
                    </h4>

                    {/* Sizing & Colors details */}
                    <div className="flex gap-3 text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-2">
                      <span>SIZE: {item.size}</span>
                      <span className="flex items-center gap-1">
                        COLOR: {item.color}
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-gray-200"
                          style={{ backgroundColor: item.colorHex }}
                        />
                      </span>
                    </div>

                    {/* Quantity selectors & Price info */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateCartQty(item.productId, item.size, item.color, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-black hover:bg-gray-50"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-3 py-1 text-[11px] font-mono text-[#111111]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.productId, item.size, item.color, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-black hover:bg-gray-50"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#111111] tracking-wide block">
                          {formattedPrice((item.salePrice || item.price) * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[9px] text-gray-400 font-mono tracking-wider block">
                            {formattedPrice(item.salePrice || item.price)} EACH
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-[#FF6B00] transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer containing Checkout controls */}
          {cart.length > 0 && (
            <div className="px-6 py-6 bg-white border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">
                  Estimated Subtotal
                </span>
                <span className="text-lg font-bold tracking-tight text-[#111111]">
                  {formattedPrice(cartSubtotal)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                Shipping fee is computed during checkout. <br />
                Colombo Region (Colombo, Gampaha, Kalutara): Rs. 350. Outstation: Rs. 450.
              </p>

              <button
                onClick={handleCheckoutClick}
                className="w-full bg-[#111111] hover:bg-[#E63946] text-white text-[11px] font-semibold tracking-[0.2em] py-4 uppercase transition-colors flex items-center justify-center gap-2 group cursor-pointer"
              >
                PROCEED TO CHECKOUT
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowCartDrawer(false)}
                className="w-full bg-transparent text-gray-500 hover:text-black text-[10px] font-semibold tracking-[0.2em] py-2 uppercase transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
