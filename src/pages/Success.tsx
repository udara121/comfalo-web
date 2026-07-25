import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { CheckCircle2, MessageSquare, ShoppingBag, Truck, Copy, Check } from 'lucide-react';

export default function Success() {
  const { navigateTo, settings } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const lastOrder = localStorage.getItem('comfalo_last_order');
    if (lastOrder) {
      try {
        setOrder(JSON.parse(lastOrder));
      } catch (e) {
        console.error('Failed to parse last order');
      }
    }
  }, []);

  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

  // Generate WhatsApp confirmation message
  const handleWhatsAppConfirm = () => {
    if (!order) return;

    const whatsappNum = settings?.whatsappNumber || '94753237633';
    const itemsText = order.items
      ? order.items.map(i => `- ${i.productName} (${i.size}/${i.color}) x${i.quantity}`).join('\n')
      : 'Items included';

    const message = `Hi Comfalo! I just placed an order on your website. Please confirm my dispatch details:

• Order Number: ${order.orderNumber}
• Customer Name: ${order.customerName}
• Delivery Phone: ${order.customerPhone}
• Address: ${order.shippingAddress}, ${order.city} (${order.district} District)

• Ordered Items:
${itemsText}

• Subtotal: ${formattedPrice(order.subtotal)}
• Shipping Fee: ${order.deliveryFee === 0 ? 'FREE' : formattedPrice(order.deliveryFee)}
• Total Amount: ${formattedPrice(order.total)}
• Payment Method: ${order.paymentMethod.toUpperCase()}

Please verify and let me know the tracking information. Thank you!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNum}?text=${encoded}`, '_blank');
  };

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-[#FAFAFA]" id="comfalo-success-empty">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 stroke-[1.2]" />
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 mb-2">
          ORDER PROCESSED
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">
          Your order was placed successfully. Explore further streetwear silhouttes.
        </p>
        <button
          onClick={() => navigateTo('/')}
          className="bg-[#111111] text-white text-[10px] font-semibold tracking-widest px-6 py-3 uppercase hover:bg-[#FF6B00] transition-colors"
        >
          BACK TO HOMEPAGE
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-16" id="comfalo-success-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Success header animation block */}
        <div className="bg-white p-8 border border-gray-100 text-center space-y-4 mb-8">
          <div className="inline-flex p-3 bg-green-50 text-green-500 rounded-full mb-2">
            <CheckCircle2 size={40} className="stroke-[1.5]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-gray-900">
            THANK YOU FOR YOUR ORDER!
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            Your streetwear collection is being curated and processed. Our delivery partners will contact you shortly.
          </p>

          <div className="flex items-center justify-center gap-3 bg-gray-50 py-3.5 px-6 border border-gray-100 w-fit mx-auto font-mono text-xs uppercase tracking-wider">
            <span>ORDER ID: <span className="font-bold text-gray-900">{order.orderNumber}</span></span>
            <button
              onClick={handleCopyOrderNumber}
              className="text-gray-400 hover:text-black transition-colors"
              title="Copy ID"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* SRILANKA CRITICAL WHATSAPP BUTTON */}
        <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-6 text-center space-y-4 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#128C7E]">
            ⚡ SPEED UP DELIVERY DISPATCH ⚡
          </h3>
          <p className="text-xs text-gray-600 uppercase tracking-wide leading-relaxed max-w-lg mx-auto">
            Sri Lankan courier dispatches are completed faster when confirmed on WhatsApp. Click below to share your order details and coordinates directly with us!
          </p>
          <button
            onClick={handleWhatsAppConfirm}
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-xs tracking-[0.18em] py-3.5 px-8 uppercase transition-colors shadow-sm cursor-pointer"
          >
            <MessageSquare size={16} /> CONFIRM ORDER ON WHATSAPP
          </button>
        </div>

        {/* Summary Sheet */}
        <div className="bg-white p-6 md:p-8 border border-gray-100 space-y-6 text-xs uppercase tracking-wider text-gray-600">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111] border-b border-gray-100 pb-2">
            Order Dispatches Summary
          </h2>

          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-gray-500">
            <div>
              <span className="font-mono text-[9px] text-gray-400 block mb-0.5">RECIPIENT NAME</span>
              <span className="text-gray-900 font-semibold">{order.customerName}</span>
            </div>
            <div>
              <span className="font-mono text-[9px] text-gray-400 block mb-0.5">MOBILE CONTACT</span>
              <span className="text-gray-900 font-semibold">{order.customerPhone}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-mono text-[9px] text-gray-400 block mb-0.5">DELIVERY LOCATION</span>
              <span className="text-gray-900 font-semibold">
                {order.shippingAddress}, {order.city} ({order.district} District)
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Items detailed review */}
          <div className="space-y-3">
            <span className="font-mono text-[9px] text-gray-400 block mb-1">INCLUDED GARMENTS</span>
            {order.items && order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-gray-700">
                <span>
                  <span className="font-bold text-gray-900">{item.productName}</span> ({item.size} / {item.color})
                  <span className="text-gray-400 text-[10px] font-mono ml-1.5">x{item.quantity}</span>
                </span>
                <span className="font-semibold font-mono">{formattedPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Billing values */}
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>SUBTOTAL</span>
              <span className="font-semibold font-mono">{formattedPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>SHIPPING FEE</span>
              <span className="font-semibold font-mono">
                {order.deliveryFee === 0 ? 'FREE DELIVERY' : formattedPrice(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between items-baseline border-t border-dashed border-gray-200 pt-3 text-gray-900">
              <span className="font-bold tracking-widest text-[#111111]">TOTAL BILLED (LKR)</span>
              <span className="text-lg font-bold font-mono text-[#111111]">{formattedPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-gray-500 pt-2 text-[10px]">
              <span>METHOD OF PAYMENT</span>
              <span className="font-semibold">{order.paymentMethod.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Back buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button
            onClick={() => navigateTo('/shop')}
            className="w-full sm:w-auto bg-[#111111] hover:bg-[#FF6B00] text-white text-[10px] font-semibold tracking-widest py-3.5 px-8 uppercase transition-colors text-center cursor-pointer"
          >
            CONTINUE STREET SHOPPING
          </button>
          
          <button
            onClick={() => navigateTo('/track')}
            className="w-full sm:w-auto bg-transparent hover:text-red-500 text-gray-500 border border-gray-200 hover:border-red-500 text-[10px] font-semibold tracking-widest py-3.5 px-8 uppercase transition-colors text-center cursor-pointer"
          >
            TRACK STATUS TIMELINE
          </button>
        </div>

      </div>
    </div>
  );
}
