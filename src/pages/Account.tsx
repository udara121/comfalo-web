import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { Lock, Mail, User as UserIcon, Phone, MapPin, ClipboardList, LogOut, ShieldAlert, KeyRound, CheckCircle, Navigation } from 'lucide-react';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 
  'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export default function Account() {
  const { user, loginUser, logoutUser, updateUserProfile, navigateTo } = useApp();

  // Auth Modes: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Input states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regDistrict, setRegDistrict] = useState('Colombo');

  // Customer Dashboard states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit fields
  const [profName, setProfName] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profWhatsapp, setProfWhatsapp] = useState('');
  const [profAddress, setProfAddress] = useState('');
  const [profCity, setProfCity] = useState('');
  const [profDistrict, setProfDistrict] = useState('Colombo');

  // Message notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync profile fields on user state changes
  useEffect(() => {
    if (user) {
      setProfName(user.fullName || '');
      setProfPhone(user.phone || '');
      setProfWhatsapp(user.whatsapp || '');
      setProfAddress(user.address || '');
      setProfCity(user.city || '');
      setProfDistrict(user.district || 'Colombo');
      fetchUserOrderHistory();
    }
  }, [user]);

  const fetchUserOrderHistory = async () => {
    if (!user) return;
    try {
      setLoadingOrders(true);
      const res = await fetch(`/api/orders/user/${user.id}`, {
        headers: {
          'x-user-id': user.id
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load user orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!loginEmail || !loginPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    try {
      setSubmitting(true);
      let authenticatedUser: any = null;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: loginPassword })
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          authenticatedUser = data.user;
        } else if (!res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          throw new Error(data.error || 'Login failed.');
        }
      } catch (apiErr: any) {
        if (apiErr.message && !apiErr.message.includes('JSON') && !apiErr.message.includes('fetch')) {
          throw apiErr;
        }
      }

      // Static fallback authentication for static Vercel hosts
      if (!authenticatedUser) {
        if (loginEmail.toLowerCase() === 'admin@comfalo.lk' && loginPassword === 'Admin@123') {
          authenticatedUser = {
            id: 'user-admin',
            fullName: 'Comfalo Admin',
            email: 'admin@comfalo.lk',
            phone: '+94771234567',
            whatsapp: '94771234567',
            userType: 'admin',
            status: 'active',
            createdAt: new Date().toISOString()
          };
        } else if (loginEmail.toLowerCase() === 'dilshan@gmail.com' && loginPassword === 'customer123') {
          authenticatedUser = {
            id: 'user-customer-1',
            fullName: 'Dilshan Silva',
            email: 'dilshan@gmail.com',
            phone: '0777654321',
            whatsapp: '94777654321',
            userType: 'customer',
            status: 'active',
            createdAt: new Date().toISOString()
          };
        } else {
          throw new Error('Invalid email or password.');
        }
      }

      loginUser(authenticatedUser);
      setSuccessMsg('Logged in successfully!');
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during login.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Required fields are missing.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          whatsapp: regWhatsapp || regPhone,
          address: regAddress,
          city: regCity,
          district: regDistrict
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Auto login after registration
      loginUser(data.user);
      setSuccessMsg('Account registered successfully!');
      // Reset registration values
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegPhone('');
      setRegWhatsapp('');
      setRegAddress('');
      setRegCity('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!profName) {
      setErrorMsg('Full Name is required.');
      return;
    }

    updateUserProfile({
      fullName: profName,
      phone: profPhone,
      whatsapp: profWhatsapp,
      address: profAddress,
      city: profCity,
      district: profDistrict
    });

    setSuccessMsg('Profile address book updated successfully!');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const formattedPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-16" id="comfalo-account-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Error / Success Notify bar */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 border-l-4 border-red-500 max-w-xl mx-auto mb-8 text-xs font-mono uppercase tracking-wider">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 border-l-4 border-green-500 max-w-xl mx-auto mb-8 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
            <CheckCircle size={14} /> {successMsg}
          </div>
        )}

        {/* --- NOT LOGGED IN: SHOW AUTHENTICATION CARD --- */}
        {!user ? (
          <div className="max-w-md mx-auto bg-white border border-gray-100 p-8 shadow-sm">
            
            {/* Header toggle */}
            <div className="flex border-b border-gray-100 mb-8 pb-3">
              <button
                onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                className={`w-1/2 pb-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                  authMode === 'login' ? 'border-b-2 border-black text-[#111111]' : 'text-gray-400 hover:text-black'
                }`}
              >
                CUSTOMER LOGIN
              </button>
              <button
                onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                className={`w-1/2 pb-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                  authMode === 'register' ? 'border-b-2 border-black text-[#111111]' : 'text-gray-400 hover:text-black'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* A. Login Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={14} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. dilshan@gmail.com"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 pl-10 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                    PASSWORD
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={14} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 pl-10 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#111111] hover:bg-[#E63946] disabled:bg-gray-200 text-white font-semibold text-xs tracking-[0.2em] py-3.5 uppercase transition-colors text-center cursor-pointer pt-4"
                >
                  {submitting ? 'Authenticating...' : 'CUSTOMER LOGIN'}
                </button>

                <p className="text-[10px] text-gray-400 text-center tracking-wider uppercase pt-4">
                  Demo Credentials: admin@comfalo.lk / Admin@123
                </p>
              </form>
            ) : (
              /* B. Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                    FULL NAME *
                  </label>
                  <div className="relative flex items-center">
                    <UserIcon size={14} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Dilshan Silva"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 pl-10 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                    EMAIL ADDRESS *
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={14} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="dilshan@gmail.com"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 pl-10 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                    CREATE PASSWORD *
                  </label>
                  <div className="relative flex items-center">
                    <KeyRound size={14} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 pl-10 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                    MOBILE PHONE *
                  </label>
                  <div className="relative flex items-center">
                    <Phone size={14} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 0777654321"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 pl-10 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                    WHATSAPP PHONE
                  </label>
                  <div className="relative flex items-center">
                    <Phone size={14} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={regWhatsapp}
                      onChange={(e) => setRegWhatsapp(e.target.value)}
                      placeholder="Leave blank to use mobile"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 pl-10 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                    SHIPPING ADDRESS *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Street, apartment, house number..."
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                      CITY *
                    </label>
                    <input
                      type="text"
                      required
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="e.g. Mount Lavinia"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                      DISTRICT *
                    </label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                    >
                      {SRI_LANKA_DISTRICTS.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#111111] hover:bg-[#E63946] disabled:bg-gray-200 text-white font-semibold text-xs tracking-[0.2em] py-3.5 uppercase transition-colors text-center cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'REGISTER ACCOUNT'}
                </button>
              </form>
            )}

          </div>
        ) : (
          /* --- LOGGED IN: SHOW CUSTOMER ACCOUNT DASHBOARD --- */
          <div className="space-y-12 animate-fadeIn" id="customer-dashboard">
            {/* 1. Welcome Profile Header */}
            <div className="bg-white p-6 md:p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#E63946] uppercase block mb-1">
                  CUSTOMER PORTAL
                </span>
                <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-gray-900">
                  Welcome back, {user.fullName}!
                </h1>
                <p className="text-[11px] font-mono text-gray-400 mt-1 uppercase tracking-wider">
                  Logged in as: {user.email} ({user.userType.toUpperCase()})
                </p>
              </div>

              <div className="flex gap-3">
                {user.userType === 'admin' && (
                  <button
                    onClick={() => navigateTo('/admin')}
                    className="bg-transparent border border-gray-200 hover:border-black text-[#111111] text-[10px] font-bold tracking-widest py-3 px-6 uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldAlert size={14} /> ADMIN CONTROLS
                  </button>
                )}
                <button
                  onClick={logoutUser}
                  className="bg-[#111111] hover:bg-[#E63946] text-white text-[10px] font-bold tracking-widest py-3 px-6 uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut size={14} /> SECURE LOGOUT
                </button>
              </div>
            </div>

            {/* 2. Grid Columns: Address Book and Order History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT: Order History list */}
              <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <ClipboardList size={18} className="text-[#E63946]" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">
                    Your Orders History
                  </h2>
                </div>

                {loadingOrders ? (
                  <p className="text-xs font-mono tracking-wider text-gray-400 uppercase py-6">FETCHING TRACK HISTORY...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-3xl text-gray-300 block mb-2">☹</span>
                    <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">NO RECENT ORDERS</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">You haven\'t placed any clothing orders with this account yet.</p>
                    <button
                      onClick={() => navigateTo('/shop')}
                      className="bg-[#111111] text-white text-[9px] font-semibold tracking-widest py-2.5 px-5 uppercase"
                    >
                      VISIT THE SHOP
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs uppercase tracking-wider font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-400 text-[9px]">
                          <th className="py-3 px-2">ORDER NO</th>
                          <th className="py-3 px-2">DATE</th>
                          <th className="py-3 px-2">TOTAL</th>
                          <th className="py-3 px-2 text-center">STATUS</th>
                          <th className="py-3 px-2 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-600">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-gray-50/50">
                            <td className="py-3.5 px-2 font-bold text-gray-900">{ord.orderNumber}</td>
                            <td className="py-3.5 px-2 text-[10px]">
                              {new Date(ord.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </td>
                            <td className="py-3.5 px-2 text-gray-900 font-bold">{formattedPrice(ord.total)}</td>
                            <td className="py-3.5 px-2 text-center">
                              <span className={`text-[8px] font-bold px-2 py-0.5 inline-block ${
                                ord.orderStatus === 'cancelled' 
                                  ? 'bg-red-50 text-red-700' 
                                  : ord.orderStatus === 'delivered' 
                                    ? 'bg-green-50 text-green-700' 
                                    : 'bg-black text-white'
                              }`}>
                                {ord.orderStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <button
                                onClick={() => navigateTo(`/track?number=${ord.orderNumber}&phone=${ord.customerPhone}`)}
                                className="text-[#E63946] hover:underline font-bold text-[10px]"
                              >
                                TRACK
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RIGHT: Edit address book */}
              <div className="lg:col-span-5 bg-white p-6 md:p-8 border border-gray-100">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
                  <MapPin size={18} className="text-[#E63946]" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">
                    Address Book Profile
                  </h2>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                      FULL CONTACT NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                        MOBILE PHONE
                      </label>
                      <input
                        type="text"
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                        WHATSAPP PHONE
                      </label>
                      <input
                        type="text"
                        value={profWhatsapp}
                        onChange={(e) => setProfWhatsapp(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                      SHIPPING STREET ADDRESS
                    </label>
                    <textarea
                      rows={3}
                      value={profAddress}
                      onChange={(e) => setProfAddress(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                        CITY / SUBURB
                      </label>
                      <input
                        type="text"
                        value={profCity}
                        onChange={(e) => setProfCity(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                        DISTRICT
                      </label>
                      <select
                        value={profDistrict}
                        onChange={(e) => setProfDistrict(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                      >
                        {SRI_LANKA_DISTRICTS.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#111111] hover:bg-[#E63946] text-white text-[10px] font-semibold tracking-widest py-3.5 uppercase transition-colors text-center cursor-pointer"
                  >
                    UPDATE ADDRESS PROFILE
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
