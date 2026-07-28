import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { Search, MapPin, Calendar, Clock, ShoppingBag, Truck, Package, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function OrderTrack() {
  const { currentPath } = useApp();
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto search if params are in url hash
  useEffect(() => {
    const params = new URLSearchParams(currentPath.split('?')[1] || '');
    const num = params.get('number');
    const ph = params.get('phone');
    if (num && ph) {
      setOrderNumber(num);
      setPhoneNumber(ph);
      performTrack(num, ph);
    }
  }, [currentPath]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!orderNumber.trim() || !phoneNumber.trim()) {
      setError('Please provide both the order number and mobile phone number.');
      return;
    }
    performTrack(orderNumber, phoneNumber);
  };

  const performTrack = async (num: string, ph: string) => {
    try {
      setLoading(true);
      setError('');
      setOrder(null);

      const url = `/api/orders/track?number=${encodeURIComponent(num.trim())}&phone=${encodeURIComponent(ph.trim())}`;
      const res = await fetch(url);
      let data: any = {};
      if (res.headers.get('content-type')?.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.error || 'No matching order located. Please check values.');
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'No matching order located. Ensure numbers match perfectly.');
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

  // Status mapping
  const statusSteps = [
    { key: 'pending', label: 'ORDER PLACED', desc: 'Awaiting verification', icon: ShoppingBag },
    { key: 'confirmed', label: 'VERIFIED', desc: 'Comfalo agent confirmed', icon: CheckCircle },
    { key: 'processing', label: 'PACKAGED', desc: 'Readying for courier pickup', icon: Package },
    { key: 'shipped', label: 'IN TRANSIT', desc: 'Dispatched with domestic partner', icon: Truck },
    { key: 'delivered', label: 'DELIVERED', desc: 'Package signed & received', icon: CheckCircle }
  ];

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  const currentStatusIndex = order ? getStatusIndex(order.orderStatus) : -1;

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-16" id="comfalo-tracking-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Page Intro title */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#FF6B00] uppercase">
            SHIPMENT INQUIRY
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold uppercase tracking-wider text-gray-900 mt-1">
            TRACK YOUR SHIPMENT
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-2 max-w-md mx-auto leading-relaxed">
            Enter your unique COMFALO order reference sequence along with your mobile phone number.
          </p>
        </div>

        {/* Input tracking values form */}
        <div className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto mb-12">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                  ORDER REFERENCE ID *
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. CMF-20260715-0001"
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                  MOBILE PHONE NUMBER *
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0777654321"
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-red-500 font-mono tracking-wider uppercase">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] hover:bg-[#FF6B00] disabled:bg-gray-200 text-white font-semibold text-xs tracking-[0.2em] py-3.5 uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={14} /> {loading ? 'SEARCHING INVENTORY DISPATCHES...' : 'QUERY DISPATCH PIPELINE'}
            </button>
          </form>
        </div>

        {/* TRACKING RESULTS DISPLAY */}
        {order && (
          <div className="space-y-8 bg-white p-6 md:p-10 border border-gray-100 shadow-sm animate-fadeIn" id="tracking-results">
            
            {/* Summary details */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 gap-4">
              <div>
                <span className="text-[10px] text-gray-400 font-mono block">ORDER NUMBER:</span>
                <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono block">DISPATCHED DATE:</span>
                <span className="text-xs font-semibold text-gray-900 uppercase">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono block">PIPELINE STATUS:</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest inline-block ${
                  order.orderStatus === 'cancelled' 
                    ? 'bg-red-100 text-red-800' 
                    : order.orderStatus === 'delivered' 
                      ? 'bg-green-100 text-green-800 animate-pulse' 
                      : 'bg-[#111111] text-white'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* STATUS TIMELINE BAR (STEPPER) */}
            {order.orderStatus === 'cancelled' ? (
              <div className="bg-red-50 border border-red-100 p-5 flex gap-4 items-center uppercase tracking-wide text-xs">
                <AlertCircle size={28} className="text-red-500 flex-shrink-0" />
                <div>
                  <span className="font-bold text-red-800 block">THIS ORDER HAS BEEN CANCELLED</span>
                  <span className="text-[10px] text-red-600 font-mono mt-0.5 block">
                    Contact Comfalo clothing brand support on WhatsApp to request re-activation or check causes.
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8">
                {/* Desktop Stepper */}
                <div className="hidden sm:flex justify-between relative">
                  {/* Background pipe line */}
                  <div className="absolute top-5 left-1/12 right-1/12 h-1 bg-gray-100 z-0">
                    <div 
                      className="h-full bg-green-500 transition-all duration-700"
                      style={{ width: `${(Math.max(0, currentStatusIndex) / (statusSteps.length - 1)) * 100}%` }}
                    ></div>
                  </div>

                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStatusIndex;
                    const isActive = idx === currentStatusIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative z-10 w-1/5">
                        <div className={`w-10 h-10 flex items-center justify-center transition-colors border-2 ${
                          isCompleted 
                            ? 'bg-green-500 text-white border-green-500' 
                            : 'bg-white text-gray-300 border-gray-100'
                        } ${isActive ? 'ring-4 ring-green-100' : ''}`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-900 mt-3 uppercase">
                          {step.label}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Stepper (Vertical layout) */}
                <div className="flex sm:hidden flex-col gap-6 relative pl-6 border-l-2 border-gray-100">
                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStatusIndex;
                    const isActive = idx === currentStatusIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        {/* Dot */}
                        <div className={`absolute -left-[35px] top-0.5 w-6 h-6 flex items-center justify-center rounded-none border-2 z-10 ${
                          isCompleted 
                            ? 'bg-green-500 text-white border-green-500' 
                            : 'bg-white text-gray-300 border-gray-200'
                        }`}>
                          <Icon size={10} />
                        </div>

                        <div>
                          <span className={`text-[10px] font-bold tracking-widest uppercase ${
                            isActive ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label} {isActive && '● CURRENT'}
                          </span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 block">
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping specifications */}
            <div className="bg-[#FAFAFA] p-6 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs uppercase tracking-wider text-gray-600">
              <div className="space-y-3 font-sans text-gray-500">
                <h4 className="text-gray-900 font-bold text-xs">RECIPIENT SPECIFICATIONS</h4>
                <p><span className="font-mono text-[9px] text-gray-400 block mb-0.5">CUSTOMER NAME:</span> <span className="text-gray-900 font-semibold">{order.customerName}</span></p>
                <p><span className="font-mono text-[9px] text-gray-400 block mb-0.5">DELIVERY PHONE:</span> <span className="text-gray-900 font-semibold">{order.customerPhone}</span></p>
                <p><span className="font-mono text-[9px] text-gray-400 block mb-0.5">SHIPPING LOCATION:</span> <span className="text-gray-900 font-semibold">{order.shippingAddress}, {order.city} ({order.district})</span></p>
              </div>

              <div className="space-y-3 font-sans text-gray-500">
                <h4 className="text-gray-900 font-bold text-xs">ORDER DETAILS</h4>
                <p><span className="font-mono text-[9px] text-gray-400 block mb-0.5">BILLING SUM:</span> <span className="text-gray-900 font-semibold">{formattedPrice(order.total)} ({order.paymentMethod.toUpperCase()})</span></p>
                {order.notes && (
                  <p><span className="font-mono text-[9px] text-gray-400 block mb-0.5">DELIVERY NOTES:</span> <span className="text-gray-900 font-semibold leading-relaxed">{order.notes}</span></p>
                )}
                <p><span className="font-mono text-[9px] text-gray-400 block mb-0.5">ESTIMATED DISPATCH WINDOW:</span> <span className="text-green-600 font-bold">2–4 WORKING DAYS ISLANDWIDE</span></p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
