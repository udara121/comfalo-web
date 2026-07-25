import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send } from 'lucide-react';

export default function WhatsAppWidget() {
  const { settings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const whatsappNum = settings?.whatsappNumber || '94753237633';
  const formattedNum = '0753237633';

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textParam = userMsg.trim() 
      ? encodeURIComponent(userMsg)
      : encodeURIComponent("Hi Comfalo! I would like to get more information about your clothing products.");
    
    const url = `https://wa.me/${whatsappNum}?text=${textParam}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* WhatsApp Popup Card */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  💬
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#075E54] rounded-full"></span>
              </div>
              <div>
                <h4 className="font-semibold text-sm tracking-wide">Comfalo Support</h4>
                <p className="text-[11px] text-green-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
                  Online | Direct WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#E5DDD5]/30 min-h-[130px] flex flex-col justify-end space-y-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] border border-gray-100">
              <p className="text-xs text-gray-800 leading-relaxed">
                Hi there! 👋 Welcome to <span className="font-semibold">Comfalo</span>. How can we help you today with your order or clothing items?
              </p>
              <span className="text-[9px] text-gray-400 block text-right mt-1 font-mono">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Input & Direct Send */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type your question..."
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              className="flex-grow text-xs bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-[#25D366] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-2.5 rounded-full transition-transform active:scale-95 shadow-md flex items-center justify-center shrink-0"
              title="Chat on WhatsApp"
            >
              <Send size={15} />
            </button>
          </form>

          {/* Direct Link Footer */}
          <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100">
            <a
              href={`https://wa.me/${whatsappNum}?text=Hi%20Comfalo,%20I'd%20like%20to%20inquire%20about%20your%20products`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-[#075E54] hover:underline flex items-center justify-center gap-1"
            >
              Direct Chat: {formattedNum}
            </a>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center focus:outline-none"
        aria-label="Contact us on WhatsApp"
      >
        {/* Notification badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold items-center justify-center">1</span>
          </span>
        )}

        {isOpen ? (
          <X size={26} />
        ) : (
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
