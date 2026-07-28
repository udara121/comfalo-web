import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Category, Banner, SiteSettings, User } from '../types';
import { supabase } from '../lib/supabase';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BANNERS, INITIAL_SETTINGS } from '../data/initialData';
import { 
  ShieldCheck, ShoppingBag, TrendingUp, AlertTriangle, Users, FileText, Settings, 
  Image, Plus, Edit, Trash2, Check, X, Search, ChevronDown, ChevronRight, Eye, 
  Printer, MessageSquare, PhoneCall, HelpCircle, LayoutGrid, Calendar, RefreshCw, Upload
} from 'lucide-react';

export default function Admin() {
  const { user, loginUser, settings, fetchSettings, navigateTo } = useApp();

  // Authentication states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Admin Active View: 'dashboard' | 'orders' | 'products' | 'categories' | 'banners' | 'settings' | 'customers'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'categories' | 'banners' | 'settings' | 'customers'>('dashboard');

  // --- Core Lists States ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications
  const [notifyMsg, setNotifyMsg] = useState({ type: '', text: '' });

  // --- Filtering & Searching States ---
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // --- CRUD Modals States ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  
  // Product Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormMode, setProductFormMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState('');
  
  // Product Fields
  const [prodName, setProdName] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodMainImage, setProdMainImage] = useState('');
  const [prodFabric, setProdFabric] = useState('');
  const [prodCare, setProdCare] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodNewArrival, setProdNewArrival] = useState(false);
  // Arrays
  const [prodSizesString, setProdSizesString] = useState('S,M,L,XL,XXL');
  const [prodColorsString, setProdColorsString] = useState('Black:#111111,White:#FAFAFA');

  // Banner Form states
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerFormMode, setBannerFormMode] = useState<'add' | 'edit'>('add');
  const [editingBannerId, setEditingBannerId] = useState('');
  const [banTitle, setBanTitle] = useState('');
  const [banSubtitle, setBanSubtitle] = useState('');
  const [banImage, setBanImage] = useState('');
  const [banLink, setBanLink] = useState('');
  const [banText, setBanText] = useState('');
  const [banOrder, setBanOrder] = useState('');
  const [banStatus, setBanStatus] = useState('active');

  // Category Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catFormMode, setCatFormMode] = useState<'add' | 'edit'>('add');
  const [editingCatId, setEditingCatId] = useState('');
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState('0');
  const [catStatus, setCatStatus] = useState('active');

  // Settings Configuration states
  const [setSiteName, setSetSiteName] = useState('');
  const [setSiteTag, setSetSiteTag] = useState('');
  const [setEmail, setSetEmail] = useState('');
  const [setPhone, setSetPhone] = useState('');
  const [setWhatsapp, setSetWhatsapp] = useState('');
  const [setColFee, setSetColFee] = useState('');
  const [setOutFee, setSetOutFee] = useState('');
  const [setThreshold, setSetThreshold] = useState('');
  const [setFb, setSetFb] = useState('');
  const [setIg, setSetIg] = useState('');
  const [setTt, setSetTt] = useState('');

  // Auto populate on tab select
  useEffect(() => {
    if (user && user.userType === 'admin') {
      loadAdminData();
    }
  }, [user, activeTab]);

  const [uploadingImage, setUploadingImage] = useState(false);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotifyMsg({ type, text });
    setTimeout(() => setNotifyMsg({ type: '', text: '' }), 6000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'product' | 'banner' = 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;

        // Try uploading to Supabase Storage first
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

          if (!error) {
            const { data: publicUrlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
              if (targetField === 'product') setProdMainImage(publicUrlData.publicUrl);
              else setBanImage(publicUrlData.publicUrl);
              showNotify('success', 'Image successfully uploaded to Supabase Storage!');
              setUploadingImage(false);
              return;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage upload fallback:', storageErr);
        }

        // Fallback to instant Base64 Image URL
        if (targetField === 'product') setProdMainImage(base64Url);
        else setBanImage(base64Url);
        showNotify('success', 'Image file selected & attached successfully!');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('File upload exception:', err);
      showNotify('error', `Upload Failed: ${err.message || err}`);
      setUploadingImage(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const headers = { 'x-user-id': user?.id || 'user-admin' };

      if (activeTab === 'dashboard' || activeTab === 'orders') {
        try {
          const res = await fetch('/api/admin/orders', { headers });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
          }
        } catch (e) {
          console.warn('Orders fetch warning:', e);
        }
      }
      
      if (activeTab === 'dashboard' || activeTab === 'products') {
        let loaded = false;
        try {
          const res = await fetch('/api/admin/products', { headers });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setProducts(data);
              loaded = true;
            }
          }
        } catch (e) {
          console.warn('Products fetch warning:', e);
        }
        if (!loaded) setProducts(INITIAL_PRODUCTS);
      }

      if (activeTab === 'products' || activeTab === 'categories') {
        let loaded = false;
        try {
          const res = await fetch('/api/admin/categories', { headers });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setCategories(data);
              loaded = true;
            }
          }
        } catch (e) {
          console.warn('Categories fetch warning:', e);
        }
        if (!loaded) setCategories(INITIAL_CATEGORIES);
      }

      if (activeTab === 'banners') {
        let loaded = false;
        try {
          const res = await fetch('/api/admin/banners', { headers });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setBanners(data);
              loaded = true;
            }
          }
        } catch (e) {
          console.warn('Banners fetch warning:', e);
        }
        if (!loaded) setBanners(INITIAL_BANNERS);
      }

      if (activeTab === 'customers') {
        try {
          const res = await fetch('/api/admin/customers', { headers });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            setCustomers(await res.json());
          }
        } catch (e) {
          console.warn('Customers fetch warning:', e);
        }
      }

      if (activeTab === 'settings') {
        const s = settings || INITIAL_SETTINGS;
        setSetSiteName(s.siteName);
        setSetSiteTag(s.siteTagline);
        setSetEmail(s.contactEmail);
        setSetPhone(s.contactPhone);
        setSetWhatsapp(s.whatsappNumber);
        setSetColFee(String(s.deliveryFeeColombo));
        setSetOutFee(String(s.deliveryFeeOutstation));
        setSetThreshold(String(s.freeDeliveryThreshold));
        setSetFb(s.facebookUrl);
        setSetIg(s.instagramUrl);
        setSetTt(s.tiktokUrl);
      }

    } catch (e) {
      console.error('Failed loading admin database:', e);
    } finally {
      setLoading(false);
    }
  };

  // Admin authentication handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!adminEmail || !adminPassword) {
      setAuthError('All fields are required.');
      return;
    }

    try {
      setAuthSubmitting(true);
      let authenticatedUser: User | null = null;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminEmail, password: adminPassword })
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          authenticatedUser = data.user;
        } else if (!res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          throw new Error(data.error || 'Authentication rejected.');
        }
      } catch (apiErr: any) {
        if (apiErr.message && !apiErr.message.includes('JSON') && !apiErr.message.includes('fetch')) {
          throw apiErr;
        }
      }

      // Static Vercel / serverless fallback authentication
      if (!authenticatedUser) {
        if (adminEmail.toLowerCase() === 'admin@comfalo.lk' && adminPassword === 'Admin@123') {
          authenticatedUser = {
            id: 'user-admin',
            fullName: 'Comfalo Admin',
            email: 'admin@comfalo.lk',
            phone: '+94771234567',
            whatsapp: '94771234567',
            address: 'No 45, Flower Road',
            city: 'Colombo 07',
            district: 'Colombo',
            userType: 'admin',
            status: 'active',
            createdAt: new Date().toISOString()
          };
        } else {
          throw new Error('Invalid staff email or secret credentials.');
        }
      }

      if (authenticatedUser.userType !== 'admin') {
        throw new Error('Access denied: Customer accounts do not possess administrative permissions.');
      }

      loginUser(authenticatedUser);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error occurred.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const formattedPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

  // --- STATS COMPUTATIONS (DASHBOARD) ---
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todaysOrders = orders.filter(o => o.createdAt.startsWith(todayDateStr));
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;
  const lowStockCount = products.filter(p => p.status === 'active' && p.stockQuantity < 5).length;
  const activeProductsCount = products.filter(p => p.status === 'active').length;

  // --- ORDER STATUS CHANGER ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotify('success', `Order status updated to ${newStatus}`);
      // Refresh current active list
      loadAdminData();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as any });
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  // --- WHATSAPP ORDER CHAT SHORTCUTS ---
  const getWhatsAppMessageLink = (ord: Order) => {
    const text = `Hi ${ord.customerName}! This is Comfalo Clothing Sri Lanka. Regarding your order ${ord.orderNumber}:`;
    return `https://wa.me/${ord.customerPhone.replace(/[\s\+\-]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  // --- PRODUCTS CRUD SUBMITTERS ---
  const handleOpenAddProduct = () => {
    setProductFormMode('add');
    setEditingProductId('');
    setProdName('');
    setProdSlug('');
    setProdSku('');
    setProdCategoryId(categories[0]?.id || '');
    setProdDesc('');
    setProdPrice('');
    setProdSalePrice('');
    setProdStock('');
    setProdMainImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800');
    setProdFabric('100% Premium Heavyweight Combed Cotton');
    setProdCare('Wash cold inside out. Hang dry.');
    setProdFeatured(false);
    setProdNewArrival(true);
    setProdSizesString('S,M,L,XL,XXL');
    setProdColorsString('Black:#111111,White:#FAFAFA');
    setShowProductForm(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setProductFormMode('edit');
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdSlug(p.slug);
    setProdSku(p.sku);
    setProdCategoryId(p.categoryId);
    setProdDesc(p.description);
    setProdPrice(String(p.price));
    setProdSalePrice(p.salePrice ? String(p.salePrice) : '');
    setProdStock(String(p.stockQuantity));
    setProdMainImage(p.mainImage);
    setProdFabric(p.fabricDetails || '');
    setProdCare(p.careInstructions || '');
    setProdFeatured(p.featured);
    setProdNewArrival(p.isNewArrival);
    
    // Sizing array back to text
    setProdSizesString(p.sizes.join(','));
    // Colors array back to text
    const colStr = p.colors.map(c => `${c.name}:${c.hex}`).join(',');
    setProdColorsString(colStr);

    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSlug || !prodPrice || !prodStock) {
      showNotify('error', 'Please fill out required fields');
      return;
    }

    // Process sizes string to array
    const sizes = prodSizesString.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    // Process colors string: name:hex,name2:hex2
    const colors = prodColorsString.split(',').map(c => {
      const parts = c.split(':');
      return {
        name: parts[0]?.trim() || 'Custom',
        hex: parts[1]?.trim() || '#111111'
      };
    }).filter(Boolean);

    const finalImage = prodMainImage.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';

    const payload = {
      name: prodName,
      slug: prodSlug.toLowerCase().trim().replace(/[\s_]+/g, '-'),
      sku: prodSku,
      categoryId: prodCategoryId,
      description: prodDesc,
      price: Number(prodPrice),
      salePrice: prodSalePrice ? Number(prodSalePrice) : null,
      stockQuantity: Number(prodStock),
      mainImage: finalImage,
      galleryImages: [finalImage],
      fabricDetails: prodFabric,
      careInstructions: prodCare,
      featured: prodFeatured,
      isNewArrival: prodNewArrival,
    };

    try {
      const url = productFormMode === 'add' ? '/api/admin/products' : `/api/admin/products/${editingProductId}`;
      const method = productFormMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-admin'
        },
        body: JSON.stringify({ ...payload, sizes, colors })
      });

      let responseData: any = null;
      if (res.headers.get('content-type')?.includes('application/json')) {
        responseData = await res.json();
      }

      if (!res.ok) {
        throw new Error(responseData?.error || `Server returned status ${res.status}`);
      }

      showNotify('success', `Product ${productFormMode === 'add' ? 'created' : 'updated'} successfully!`);
      setShowProductForm(false);
      await loadAdminData();
    } catch (err: any) {
      console.error('Product submit error:', err);
      showNotify('error', err.message || 'Failed to save product on server');
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this product from the database?')) return;

    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || 'user-admin' }
      });
      if (res.ok) {
        showNotify('success', 'Product deleted permanently!');
        await loadAdminData();
      } else {
        const data = await res.json();
        showNotify('error', data.error || 'Delete failed on server.');
        await loadAdminData();
      }
    } catch (err: any) {
      showNotify('error', 'Delete failed.');
      await loadAdminData();
    }
  };

  // --- SETTINGS SUBMITTER ---
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-admin'
        },
        body: JSON.stringify({
          siteName: setSiteName,
          siteTagline: setSiteTag,
          contactEmail: setEmail,
          contactPhone: setPhone,
          whatsappNumber: setWhatsapp,
          deliveryFeeColombo: Number(setColFee),
          deliveryFeeOutstation: Number(setOutFee),
          freeDeliveryThreshold: Number(setThreshold),
          facebookUrl: setFb,
          instagramUrl: setIg,
          tiktokUrl: setTt
        })
      });

      if (res.ok) {
        showNotify('success', 'Comfalo configurations synced successfully!');
        fetchSettings(); // update context settings!
      } else {
        throw new Error('Failed updating.');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const [migrating, setMigrating] = useState(false);

  const handleMigrateSupabase = async () => {
    if (!window.confirm('Do you want to sync/migrate all products, categories, banners and settings from local database to Supabase Cloud Database?')) return;
    try {
      setMigrating(true);
      const res = await fetch('/api/admin/migrate-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-admin'
        }
      });
      
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (pErr) {
        throw new Error(rawText || 'Server communication issue');
      }

      if (res.ok) {
        if (data.summary?.errors && data.summary.errors.length > 0) {
          showNotify('error', `Supabase Table Note: ${data.summary.errors[0]}`);
        } else {
          showNotify('success', `Supabase Migration Completed! (${data.summary?.products || 0} Products, ${data.summary?.categories || 0} Categories, ${data.summary?.banners || 0} Banners synced)`);
        }
      } else {
        throw new Error(data.error || 'Migration failed');
      }
    } catch (err: any) {
      showNotify('error', `Migration Note: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  // --- CATEGORIES CRUD ---
  const handleOpenAddCategory = () => {
    setCatFormMode('add');
    setEditingCatId('');
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatOrder('0');
    setCatStatus('active');
    setShowCategoryForm(true);
  };

  const handleOpenEditCategory = (c: Category) => {
    setCatFormMode('edit');
    setEditingCatId(c.id);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDesc(c.description);
    setCatOrder(String(c.sortOrder));
    setCatStatus(c.status);
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = catFormMode === 'add' ? '/api/admin/categories' : `/api/admin/categories/${editingCatId}`;
      const method = catFormMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-admin'
        },
        body: JSON.stringify({
          name: catName,
          slug: catSlug.toLowerCase().trim().replace(/[\s_]+/g, '-'),
          description: catDesc,
          sortOrder: Number(catOrder),
          status: catStatus
        })
      });

      let responseData: any = null;
      if (res.headers.get('content-type')?.includes('application/json')) {
        responseData = await res.json();
      }

      if (!res.ok) {
        throw new Error(responseData?.error || `Server error (${res.status})`);
      }

      showNotify('success', `Category saved successfully`);
      setShowCategoryForm(false);
      await loadAdminData();
    } catch (e: any) {
      showNotify('error', e.message || 'Failed to save category');
    }
  };

  // --- BANNERS CRUD ---
  const handleOpenAddBanner = () => {
    setBannerFormMode('add');
    setEditingBannerId('');
    setBanTitle('');
    setBanSubtitle('');
    setBanImage('https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600');
    setBanLink('/shop');
    setBanText('SHOP NOW');
    setBanOrder('0');
    setBanStatus('active');
    setShowBannerForm(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setBannerFormMode('edit');
    setEditingBannerId(b.id);
    setBanTitle(b.title);
    setBanSubtitle(b.subtitle);
    setBanImage(b.image);
    setBanLink(b.linkUrl);
    setBanText(b.buttonText);
    setBanOrder(String(b.sortOrder));
    setBanStatus(b.status);
    setShowBannerForm(true);
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = bannerFormMode === 'add' ? '/api/admin/banners' : `/api/admin/banners/${editingBannerId}`;
      const method = bannerFormMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-admin'
        },
        body: JSON.stringify({
          title: banTitle,
          subtitle: banSubtitle,
          image: banImage,
          linkUrl: banLink,
          buttonText: banText,
          sortOrder: Number(banOrder),
          status: banStatus
        })
      });

      let responseData: any = null;
      if (res.headers.get('content-type')?.includes('application/json')) {
        responseData = await res.json();
      }

      if (!res.ok) {
        throw new Error(responseData?.error || `Server error (${res.status})`);
      }

      showNotify('success', `Banner slider updated`);
      setShowBannerForm(false);
      await loadAdminData();
    } catch (e: any) {
      showNotify('error', e.message || 'Failed updating banner');
    }
  };

  const handleDeleteBanner = async (banId: string) => {
    if (!window.confirm('Delete this home hero slide banner?')) return;
    try {
      const res = await fetch(`/api/admin/banners/${banId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user!.id }
      });
      if (res.ok) {
        showNotify('success', 'Banner deleted successfully');
        await loadAdminData();
      }
    } catch (e: any) {
      showNotify('error', 'Failed deleting banner');
    }
  };

  const handleQuickReplenishStock = async (p: Product, extraQty: number) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id
        },
        body: JSON.stringify({ stockQuantity: p.stockQuantity + extraQty })
      });
      if (res.ok) {
        showNotify('success', `Replenished +${extraQty} stock for ${p.name}`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- NOT AN ADMIN: FORCE LOGIN PORTAL ---
  if (!user || user.userType !== 'admin') {
    return (
      <div className="bg-[#FAFAFA] min-h-screen py-16 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white border border-gray-100 p-8 shadow-sm">
          <div className="text-center mb-6">
            <span className="text-red-500 font-bold tracking-widest text-[10px] block mb-2 uppercase">
              ADMIN CONTROL CENTER
            </span>
            <h1 className="text-lg font-bold tracking-wide text-gray-900 uppercase">
              COMFALO STAFF SIGN IN
            </h1>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 p-3.5 mb-4 text-[10px] uppercase tracking-wider font-mono">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                STAFF KEY-EMAIL
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@comfalo.lk"
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">
                SECRET CREDENTIALS
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full bg-[#111111] hover:bg-[#FF6B00] text-white font-semibold text-xs tracking-widest py-3.5 uppercase transition-colors cursor-pointer"
            >
              {authSubmitting ? 'Verifying Key...' : 'AUTHENTICATE STAFF'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter orders lists
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderFilterStatus === 'all' || o.orderStatus === orderFilterStatus;
    const matchesQuery = !orderSearch || 
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Filter products lists
  const filteredProducts = products.filter((p) => {
    return !productSearch || 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-16" id="comfalo-admin-workspace">
      
      {/* Top action header info */}
      <div className="bg-[#111111] text-white py-6 px-4 md:px-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] tracking-[0.3em] text-[#FF6B00] font-bold block uppercase">
            COMFALO HQ WORKSPACE
          </span>
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider">
            ADMINISTRATIVE CONSOLE
          </h1>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigateTo('/')}
            className="bg-transparent border border-gray-700 hover:border-white text-gray-300 hover:text-white text-[10px] font-bold tracking-widest py-2 px-4 uppercase transition-all"
          >
            VIEW FRONT STORE
          </button>
          <span className="bg-green-600 text-white font-mono text-[9px] px-2.5 py-1.5 uppercase flex items-center gap-1">
            <ShieldCheck size={12} /> SECURE SHELL
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Toast Notification banner */}
        {notifyMsg.text && (
          <div className={`p-4 border-l-4 mb-8 text-xs font-mono uppercase tracking-wider flex items-center justify-between ${
            notifyMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'
          }`}>
            <span>{notifyMsg.text}</span>
            <button onClick={() => setNotifyMsg({ type: '', text: '' })}><X size={14} /></button>
          </div>
        )}

        {/* Tab Selection rail */}
        <div className="flex overflow-x-auto gap-1 border-b border-gray-200 mb-8 pb-1 scrollbar-none font-sans">
          {[
            { id: 'dashboard', label: 'DASHBOARD STATS', icon: TrendingUp },
            { id: 'orders', label: `ORDERS (${orders.length})`, icon: ShoppingBag },
            { id: 'products', label: `PRODUCTS (${products.length})`, icon: LayoutGrid },
            { id: 'categories', label: 'CATEGORIES', icon: FileText },
            { id: 'banners', label: 'HERO BANNERS', icon: Image },
            { id: 'customers', label: 'CUSTOMERS', icon: Users },
            { id: 'settings', label: 'SITE SETTINGS', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-[#FF6B00] text-[#FF6B00] bg-white' 
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- VIEW TABS --- */}

        {/* A. DASHBOARD STATS VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn" id="admin-tab-dashboard">
            {/* 4 Cards stat block */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">TODAY\'S ORDERS</span>
                <span className="text-2xl font-bold text-gray-900">{todaysOrders.length}</span>
                <span className="text-[9px] text-gray-400 font-mono tracking-wider mt-2">CMF ORDER COUNT FOR TODAY</span>
              </div>
              <div className="bg-white p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">TODAY\'S REVENUE (LKR)</span>
                <span className="text-2xl font-bold text-[#FF6B00]">{formattedPrice(todaysRevenue)}</span>
                <span className="text-[9px] text-gray-400 font-mono tracking-wider mt-2">EXCLUDING CANCELLED DISPATCHES</span>
              </div>
              <div className="bg-white p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">PENDING VERIFICATION</span>
                <span className={`text-2xl font-bold ${pendingOrdersCount > 0 ? 'text-amber-600 animate-pulse' : 'text-gray-900'}`}>
                  {pendingOrdersCount}
                </span>
                <span className="text-[9px] text-gray-400 font-mono tracking-wider mt-2">AWAITING AD-HOC VERIFICATION</span>
              </div>
              <div className="bg-white p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">LOW-STOCK WARNINGS</span>
                <span className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>{lowStockCount}</span>
                <span className="text-[9px] text-gray-400 font-mono tracking-wider mt-2">STOCK COUNT IS UNDER 5 PIECES</span>
              </div>
            </div>

            {/* Crucial Low Stock replenisher list */}
            {lowStockCount > 0 && (
              <div className="bg-amber-50 border border-amber-100 p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800 flex items-center gap-2">
                  <AlertTriangle size={16} /> REPLENISH LOW STOCK PIECES (STOCK &lt; 5)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.filter(p => p.status === 'active' && p.stockQuantity < 5).map(prod => (
                    <div key={prod.id} className="bg-white p-3.5 border border-amber-100 flex items-center justify-between gap-3 text-xs">
                      <div className="truncate flex-grow">
                        <span className="font-bold text-gray-900 truncate block">{prod.name}</span>
                        <span className="text-[9px] font-mono text-gray-400 tracking-wider block">SKU: {prod.sku} • STOCK: {prod.stockQuantity}</span>
                      </div>
                      <button
                        onClick={() => handleQuickReplenishStock(prod, 15)}
                        className="bg-amber-600 text-white text-[9px] font-bold tracking-widest px-3 py-1.5 uppercase hover:bg-black transition-colors flex-shrink-0"
                      >
                        ADD +15 STOCK
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Overview */}
            <div className="bg-white p-6 md:p-8 border border-gray-100 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111] mb-6">
                RECENT INCOMING ORDERS
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs uppercase tracking-wider font-mono">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-[9px]">
                      <th className="py-2.5 px-2">ORDER NUMBER</th>
                      <th className="py-2.5 px-2">CUSTOMER</th>
                      <th className="py-2.5 px-2">DISTRICT</th>
                      <th className="py-2.5 px-2">TOTAL</th>
                      <th className="py-2.5 px-2">METHOD</th>
                      <th className="py-2.5 px-2 text-center">STATUS</th>
                      <th className="py-2.5 px-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-2 font-bold text-gray-900">{ord.orderNumber}</td>
                        <td className="py-3 px-2 text-gray-900">{ord.customerName} <span className="text-[9px] text-gray-400 font-normal">({ord.customerPhone})</span></td>
                        <td className="py-3 px-2">{ord.district}</td>
                        <td className="py-3 px-2 text-gray-900 font-bold">{formattedPrice(ord.total)}</td>
                        <td className="py-3 px-2 text-[10px]">{ord.paymentMethod.toUpperCase()}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-[8px] font-bold px-2 py-0.5 inline-block ${
                            ord.orderStatus === 'cancelled' 
                              ? 'bg-red-100 text-red-800' 
                              : ord.orderStatus === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-[#111111] text-white'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => { setSelectedOrder(ord); setActiveTab('orders'); }}
                            className="text-[#FF6B00] hover:underline text-[10px] font-bold"
                          >
                            MANAGE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* B. ORDERS MANAGEMENT VIEW */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-orders">
            
            {/* Filter and query order bar */}
            <div className="bg-white p-4 border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2 relative w-full sm:w-auto">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="SEARCH REF / PHONE / NAME..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="bg-[#FAFAFA] border border-gray-200 rounded-none py-2 pl-9 pr-4 text-[10px] tracking-wider text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none w-full sm:w-60 uppercase font-mono"
                />
              </div>

              <div className="flex items-center gap-2 relative w-full sm:w-auto justify-end">
                <span className="text-[10px] text-gray-400 tracking-wider font-semibold uppercase">STATUS FILTER:</span>
                <select
                  value={orderFilterStatus}
                  onChange={(e) => setOrderFilterStatus(e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-none py-1.5 px-3 pr-8 text-[10px] tracking-wider uppercase font-mono focus:ring-1 focus:ring-black outline-none"
                >
                  <option value="all">ALL PIPELINE ORDERS</option>
                  <option value="pending">PENDING</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="processing">PROCESSING</option>
                  <option value="shipped">SHIPPED</option>
                  <option value="delivered">DELIVERED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* List orders */}
            <div className="bg-white border border-gray-100 shadow-xs">
              {filteredOrders.length === 0 ? (
                <p className="text-center py-12 text-xs font-mono text-gray-400 uppercase tracking-widest">
                  No orders found matching selected status/search query.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs uppercase tracking-wider font-mono">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 text-[9px] bg-gray-50/50">
                        <th className="py-3 px-4">ORDER NUMBER</th>
                        <th className="py-3 px-2">CREATED ON</th>
                        <th className="py-3 px-2">RECIPIENT</th>
                        <th className="py-3 px-2">LOCATION</th>
                        <th className="py-3 px-2">BILLING SUM</th>
                        <th className="py-3 px-2">METHOD</th>
                        <th className="py-3 px-2 text-center">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/50">
                          <td className="py-3.5 px-4 font-bold text-gray-900">{ord.orderNumber}</td>
                          <td className="py-3.5 px-2 text-[10px]">
                            {new Date(ord.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-2 text-gray-900">
                            {ord.customerName}
                            <p className="text-[9px] text-gray-400 font-normal font-mono">{ord.customerPhone}</p>
                          </td>
                          <td className="py-3.5 px-2 truncate max-w-[120px]" title={ord.shippingAddress}>
                            {ord.city} ({ord.district})
                          </td>
                          <td className="py-3.5 px-2 text-gray-900 font-bold">{formattedPrice(ord.total)}</td>
                          <td className="py-3.5 px-2 text-[10px] font-bold">{ord.paymentMethod.toUpperCase()}</td>
                          <td className="py-3.5 px-2 text-center">
                            <span className={`text-[8px] font-bold px-2 py-0.5 inline-block ${
                              ord.orderStatus === 'cancelled' 
                                ? 'bg-red-100 text-red-800' 
                                : ord.orderStatus === 'delivered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-[#111111] text-white'
                            }`}>
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="bg-transparent border border-gray-200 hover:border-black text-gray-700 hover:text-black font-bold text-[9px] tracking-widest py-1.5 px-2.5 uppercase"
                            >
                              MANAGE
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* C. PRODUCTS LIST VIEW */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-products">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-gray-100">
              <div className="flex gap-2 relative w-full sm:w-auto">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="SEARCH SKU / PRODUCT NAME..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="bg-[#FAFAFA] border border-gray-200 rounded-none py-2 pl-9 pr-4 text-[10px] tracking-wider text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none w-full sm:w-60 uppercase font-mono"
                />
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="w-full sm:w-auto bg-[#111111] hover:bg-[#FF6B00] text-white text-[10px] font-bold tracking-widest py-3 px-5 uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> ADD NEW PRODUCT
              </button>
            </div>

            {/* Grid listing */}
            <div className="bg-white border border-gray-100 shadow-xs">
              {filteredProducts.length === 0 ? (
                <p className="text-center py-12 text-xs font-mono text-gray-400 uppercase tracking-widest">No products found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs uppercase tracking-wider font-mono">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 text-[9px] bg-gray-50/50">
                        <th className="py-3 px-4">PHOTO</th>
                        <th className="py-3 px-2">SKU</th>
                        <th className="py-3 px-2">PRODUCT NAME</th>
                        <th className="py-3 px-2">PRICE (LKR)</th>
                        <th className="py-3 px-2">STOCK QTY</th>
                        <th className="py-3 px-2 text-center">FEATURED</th>
                        <th className="py-3 px-2 text-center">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-4">
                            <div className="w-10 h-12 bg-gray-100 overflow-hidden border border-gray-100">
                              <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          </td>
                          <td className="py-2.5 px-2 font-bold text-gray-900">{p.sku}</td>
                          <td className="py-2.5 px-2 font-bold text-gray-900">{p.name}</td>
                          <td className="py-2.5 px-2 text-gray-900">
                            {p.salePrice ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-red-600">{formattedPrice(p.salePrice)}</span>
                                <span className="text-[9px] text-gray-400 line-through">{formattedPrice(p.price)}</span>
                              </div>
                            ) : (
                              <span>{formattedPrice(p.price)}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className={`font-bold ${p.stockQuantity < 5 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
                              {p.stockQuantity}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {p.featured ? <span className="text-green-600 font-bold">YES</span> : <span className="text-gray-300">NO</span>}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className={`text-[8px] font-bold px-2 py-0.5 inline-block uppercase ${
                              p.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : p.status === 'out_of_stock' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="text-blue-600 hover:underline text-[10px] font-bold"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-[#FF6B00] hover:underline text-[10px] font-bold"
                            >
                              DELETE
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* D. CATEGORIES VIEW */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-categories">
            <div className="flex justify-end">
              <button
                onClick={handleOpenAddCategory}
                className="bg-[#111111] hover:bg-[#FF6B00] text-white text-[10px] font-bold tracking-widest py-3 px-5 uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> ADD NEW CATEGORY
              </button>
            </div>

            <div className="bg-white border border-gray-100 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs uppercase tracking-wider font-mono">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-[9px] bg-gray-50/50">
                      <th className="py-3 px-4">NAME</th>
                      <th className="py-3 px-2">SLUG</th>
                      <th className="py-3 px-2">DESCRIPTION</th>
                      <th className="py-3 px-2 text-center">SORT ORDER</th>
                      <th className="py-3 px-2 text-center">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{cat.name}</td>
                        <td className="py-3.5 px-2 text-gray-900 font-bold">{cat.slug}</td>
                        <td className="py-3.5 px-2 max-w-xs truncate" title={cat.description}>{cat.description}</td>
                        <td className="py-3.5 px-2 text-center font-bold">{cat.sortOrder}</td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`text-[8px] font-bold px-2 py-0.5 inline-block ${
                            cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="text-blue-600 hover:underline text-[10px] font-bold"
                          >
                            EDIT
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* E. BANNERS VIEW */}
        {activeTab === 'banners' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-banners">
            <div className="flex justify-end">
              <button
                onClick={handleOpenAddBanner}
                className="bg-[#111111] hover:bg-[#FF6B00] text-white text-[10px] font-bold tracking-widest py-3 px-5 uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> ADD HERO BANNER
              </button>
            </div>

            <div className="bg-white border border-gray-100 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs uppercase tracking-wider font-mono">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-[9px] bg-gray-50/50">
                      <th className="py-3 px-4">THUMBNAIL</th>
                      <th className="py-3 px-2">BANNER TITLE</th>
                      <th className="py-3 px-2">BUTTON LINK</th>
                      <th className="py-3 px-2 text-center">SORT</th>
                      <th className="py-3 px-2 text-center">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {banners.map((ban) => (
                      <tr key={ban.id} className="hover:bg-gray-50/50">
                        <td className="py-2 px-4">
                          <div className="w-16 h-10 bg-gray-100 overflow-hidden border border-gray-100">
                            <img src={ban.image} alt={ban.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        </td>
                        <td className="py-3.5 px-2 font-bold text-gray-900">{ban.title}</td>
                        <td className="py-3.5 px-2 lowercase text-[10px]">{ban.linkUrl}</td>
                        <td className="py-3.5 px-2 text-center font-bold">{ban.sortOrder}</td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`text-[8px] font-bold px-2 py-0.5 inline-block ${
                            ban.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {ban.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-3">
                          <button
                            onClick={() => handleOpenEditBanner(ban)}
                            className="text-blue-600 hover:underline text-[10px] font-bold"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(ban.id)}
                            className="text-[#FF6B00] hover:underline text-[10px] font-bold"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* F. CUSTOMERS VIEW */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-customers">
            <div className="bg-white border border-gray-100 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs uppercase tracking-wider font-mono">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-[9px] bg-gray-50/50">
                      <th className="py-3 px-4">CUSTOMER NAME</th>
                      <th className="py-3 px-2">EMAIL</th>
                      <th className="py-3 px-2">CONTACT PHONE</th>
                      <th className="py-3 px-2">ORDERS COUNT</th>
                      <th className="py-3 px-2">TOTAL SPENT</th>
                      <th className="py-3 px-2 text-center">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{cust.fullName}</td>
                        <td className="py-3.5 px-2 lowercase text-[10px] text-gray-500">{cust.email}</td>
                        <td className="py-3.5 px-2">{cust.phone || 'N/A'}</td>
                        <td className="py-3.5 px-2 font-bold text-gray-900 text-center">{cust.ordersCount}</td>
                        <td className="py-3.5 px-2 font-bold text-[#FF6B00]">{formattedPrice(cust.totalSpent)}</td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`text-[8px] font-bold px-2 py-0.5 inline-block ${
                            cust.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cust.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-gray-400 text-[10px]">Registered Customer</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* G. SITE CONFIGURATIONS SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSettingsSubmit} className="bg-white p-6 md:p-8 border border-gray-100 shadow-xs max-w-3xl mx-auto space-y-6" id="admin-tab-settings">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#111111] border-b border-gray-100 pb-2">
              COMFALO BRAND CONTEXT SETTINGS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">BRAND TITLE</label>
                <input
                  type="text"
                  required
                  value={setSiteName}
                  onChange={(e) => setSetSiteName(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">BRAND TAGLINE</label>
                <input
                  type="text"
                  required
                  value={setSiteTag}
                  onChange={(e) => setSetSiteTag(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black uppercase outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">SUPPORT WHATSAPP PHONE (94...)</label>
                <input
                  type="text"
                  required
                  value={setWhatsapp}
                  onChange={(e) => setSetWhatsapp(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">CONTACT EMAIL</label>
                <input
                  type="email"
                  required
                  value={setEmail}
                  onChange={(e) => setSetEmail(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div className="sm:col-span-2 border-t border-gray-100 my-2 pt-2">
                <h4 className="text-gray-900 font-bold text-xs">SRI LANKA COURIER DELIVERY FEES (LKR)</h4>
              </div>

              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">COLOMBO REGION FEE</label>
                <input
                  type="number"
                  required
                  value={setColFee}
                  onChange={(e) => setSetColFee(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">OUTSTATION FEE</label>
                <input
                  type="number"
                  required
                  value={setOutFee}
                  onChange={(e) => setSetOutFee(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">FREE SHIPPING THRESHOLD</label>
                <input
                  type="number"
                  required
                  value={setThreshold}
                  onChange={(e) => setSetThreshold(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div className="sm:col-span-2 border-t border-gray-100 my-2 pt-2">
                <h4 className="text-gray-900 font-bold text-xs">SOCIAL INTEGRATIONS</h4>
              </div>

              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">FACEBOOK URL</label>
                <input
                  type="text"
                  value={setFb}
                  onChange={(e) => setSetFb(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">INSTAGRAM URL</label>
                <input
                  type="text"
                  value={setIg}
                  onChange={(e) => setSetIg(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full bg-[#111111] hover:bg-[#FF6B00] text-white text-[10px] font-semibold tracking-widest py-3.5 uppercase transition-colors text-center cursor-pointer shadow-xs"
              >
                SYNC CONFIGURATIONS WITH DATABASE
              </button>

              <button
                type="button"
                onClick={handleMigrateSupabase}
                disabled={migrating}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold tracking-widest py-3.5 uppercase transition-colors text-center cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className={migrating ? 'animate-spin' : ''} />
                {migrating ? 'MIGRATING DATA TO SUPABASE...' : '⚡ 1-CLICK MIGRATE ALL LOCAL DATA TO SUPABASE CLOUD DB'}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* --- SELECTED ORDER MANAGE MODAL / DRAWER --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="bg-white border border-gray-100 shadow-2xl relative z-50 w-full max-w-3xl max-h-[90vh] flex flex-col uppercase font-mono tracking-wider text-xs text-gray-600">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-900">MANAGE ORDER {selectedOrder.orderNumber}</span>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black"><X size={20} /></button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              
              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 border border-gray-100 font-sans text-gray-500">
                <div>
                  <span className="font-mono text-[9px] text-gray-400 block mb-0.5">RECIPIENT CONTACT:</span>
                  <span className="text-gray-900 font-bold block">{selectedOrder.customerName}</span>
                  <span className="text-gray-900 font-bold block mt-0.5">{selectedOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-gray-400 block mb-0.5">DELIVERY LOCATION:</span>
                  <span className="text-gray-900 font-bold block">{selectedOrder.shippingAddress}</span>
                  <span className="text-gray-900 font-bold block mt-0.5">{selectedOrder.city} ({selectedOrder.district})</span>
                </div>
                {selectedOrder.notes && (
                  <div className="sm:col-span-2">
                    <span className="font-mono text-[9px] text-gray-400 block mb-0.5">STAFF NOTES:</span>
                    <span className="text-gray-700 block leading-relaxed">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <span className="font-mono text-[9px] text-gray-400 block mb-2">ORDERED SILHOUETTE PIECES:</span>
                <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-3">
                      <span>
                        <span className="font-bold text-gray-900">{item.productName}</span> ({item.size} / {item.color})
                        <span className="text-gray-400 ml-1">x{item.quantity}</span>
                      </span>
                      <span className="font-bold text-gray-900">{formattedPrice(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Math */}
              <div className="flex justify-end font-sans">
                <div className="w-60 space-y-1.5 text-right font-mono text-gray-500">
                  <div className="flex justify-between"><span>SUBTOTAL:</span> <span className="font-bold text-gray-900">{formattedPrice(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between"><span>SHIPPING:</span> <span className="font-bold text-gray-900">{selectedOrder.deliveryFee === 0 ? 'FREE' : formattedPrice(selectedOrder.deliveryFee)}</span></div>
                  <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-sm text-gray-900 font-bold">
                    <span>BILLED SUM:</span> <span>{formattedPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status workflow change buttons */}
              <div className="border-t border-gray-100 pt-6">
                <span className="font-mono text-[9px] text-gray-400 block mb-3">UPDATE PIPELINE SHIPMENT STATUS:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'confirmed')}
                    className={`px-3 py-2 uppercase font-bold text-[9px] tracking-widest border transition-all ${
                      selectedOrder.orderStatus === 'confirmed' ? 'bg-black text-white border-black' : 'bg-transparent border-gray-200 hover:border-black text-gray-700'
                    }`}
                  >
                    CONFIRM ORDER
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')}
                    className={`px-3 py-2 uppercase font-bold text-[9px] tracking-widest border transition-all ${
                      selectedOrder.orderStatus === 'processing' ? 'bg-black text-white border-black' : 'bg-transparent border-gray-200 hover:border-black text-gray-700'
                    }`}
                  >
                    PACKAGED
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')}
                    className={`px-3 py-2 uppercase font-bold text-[9px] tracking-widest border transition-all ${
                      selectedOrder.orderStatus === 'shipped' ? 'bg-black text-white border-black' : 'bg-transparent border-gray-200 hover:border-black text-gray-700'
                    }`}
                  >
                    DISPATCH
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
                    className={`px-3 py-2 uppercase font-bold text-[9px] tracking-widest border transition-all ${
                      selectedOrder.orderStatus === 'delivered' ? 'bg-green-600 text-white border-green-600' : 'bg-transparent border-gray-200 hover:border-green-600 text-green-700'
                    }`}
                  >
                    DELIVERED
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}
                    className={`px-3 py-2 uppercase font-bold text-[9px] tracking-widest border transition-all ${
                      selectedOrder.orderStatus === 'cancelled' ? 'bg-red-600 text-white border-red-600' : 'bg-transparent border-gray-200 hover:border-red-600 text-red-700'
                    }`}
                  >
                    CANCEL ORDER
                  </button>
                </div>
              </div>

            </div>

            {/* Modal footer controls */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50 justify-end">
              <a
                href={getWhatsAppMessageLink(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-[9px] tracking-widest py-3 px-5 uppercase flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MessageSquare size={14} /> MESSAGE CLIENT VIA WHATSAPP
              </a>
              <button
                onClick={() => setShowInvoice(true)}
                className="bg-[#111111] hover:bg-[#FF6B00] text-white font-bold text-[9px] tracking-widest py-3 px-5 uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> GENERATE COMFALO INVOICE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- COMFALO BRAND PRINTABLE INVOICE MODAL --- */}
      {selectedOrder && showInvoice && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowInvoice(false)}></div>
          
          <div className="bg-white p-8 border shadow-2xl relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col text-xs uppercase tracking-wider font-mono text-gray-900 border-gray-900">
            {/* Printable Frame */}
            <div className="space-y-6" id="printable-invoice">
              
              {/* Invoice Brand header */}
              <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6">
                <div>
                  <h1 className="text-xl font-bold tracking-[0.2em]">COMFALO APPARELS</h1>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">COMFORT. STYLE. YOU.</p>
                  <p className="text-[9px] text-gray-400 font-mono mt-1">SUPPORT: hello@comfalo.lk • +94 77 123 4567</p>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-bold bg-black text-white py-1 px-3">OFFICIAL INVOICE</h2>
                  <p className="text-[9px] font-mono mt-2">REF: {selectedOrder.orderNumber}</p>
                  <p className="text-[9px] font-mono">DATE: {new Date(selectedOrder.createdAt).toLocaleDateString('en-US')}</p>
                </div>
              </div>

              {/* Recipients columns */}
              <div className="grid grid-cols-2 gap-8 text-[10px]">
                <div className="space-y-1">
                  <span className="font-bold text-gray-400 block mb-0.5">SHIPPED FROM:</span>
                  <span className="font-bold block">COMFALO BRAND WAREHOUSE</span>
                  <span className="block">No. 158, Flower Road</span>
                  <span className="block">Colombo 07, Sri Lanka</span>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-gray-400 block mb-0.5">SHIPPED TO:</span>
                  <span className="font-bold block">{selectedOrder.customerName}</span>
                  <span className="block">{selectedOrder.shippingAddress}</span>
                  <span className="block">{selectedOrder.city} ({selectedOrder.district})</span>
                  <span className="font-bold block">PHONE: {selectedOrder.customerPhone}</span>
                </div>
              </div>

              {/* Items detailed table */}
              <div className="border-t border-b-2 border-gray-900 py-2">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="font-bold text-gray-400 border-b border-gray-200">
                      <th className="py-2">DESCRIPTION / SIZE / COLOR</th>
                      <th className="py-2 text-center">QTY</th>
                      <th className="py-2 text-right">UNIT PRICE</th>
                      <th className="py-2 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-gray-900">{item.productName} ({item.size}/{item.color})</td>
                        <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                        <td className="py-2.5 text-right font-mono">{formattedPrice(item.unitPrice)}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-gray-900">{formattedPrice(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Math summaries */}
              <div className="flex justify-end">
                <div className="w-60 text-right space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between"><span>SUBTOTAL:</span> <span className="font-bold">{formattedPrice(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between"><span>COURIER DELIVERY:</span> <span className="font-bold">{selectedOrder.deliveryFee === 0 ? 'FREE' : formattedPrice(selectedOrder.deliveryFee)}</span></div>
                  <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-xs font-bold text-gray-900">
                    <span>BILLED TOTAL:</span> <span>{formattedPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Lower legal notes */}
              <div className="border-t border-gray-200 pt-4 text-center text-[8px] text-gray-400 space-y-1">
                <p>ALL GOODS LISTED ARE LICENSED COMFALO STREETWEAR PRODUCTS DESIGNED AND MANUFACTURED IN SRI LANKA.</p>
                <p>PAYMENT METHOD COMPLETED BY COD OR DIRECT TRANSFERS. EASY SIZE EXCHANGES AVAILABLE WITHIN 7 DISPATCH DAYS.</p>
              </div>

            </div>

            {/* Print trigger actions */}
            <div className="mt-8 flex gap-3 justify-end relative z-10 border-t border-gray-100 pt-4 bg-white">
              <button
                onClick={() => window.print()}
                className="bg-[#111111] hover:bg-black text-white font-bold text-[9px] tracking-widest py-3 px-6 uppercase transition-all"
              >
                PRINT PAPER INVOICE
              </button>
              <button
                onClick={() => setShowInvoice(false)}
                className="bg-transparent border border-gray-200 hover:border-black text-gray-700 text-[9px] tracking-widest py-3 px-6 uppercase transition-all"
              >
                CLOSE PREVIEW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DYNAMIC PRODUCT CREATION/EDIT MODAL --- */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowProductForm(false)}></div>
          
          <form onSubmit={handleProductSubmit} className="bg-white border border-gray-100 shadow-2xl relative z-50 w-full max-w-2xl max-h-[90vh] flex flex-col uppercase font-mono tracking-wider text-xs text-gray-600">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <span className="font-bold text-gray-900">{productFormMode === 'add' ? 'ADD DROP PRODUCT' : `EDIT PRODUCT ${prodSku}`}</span>
              <button type="button" onClick={() => setShowProductForm(false)}><X size={20} /></button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">PRODUCT NAME *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => {
                      setProdName(e.target.value);
                      if (productFormMode === 'add') {
                        setProdSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">PRODUCT SLUG *</label>
                  <input
                    type="text"
                    required
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none lowercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">SKU REFERENCE</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="Auto-generated if left empty"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">COLLECTION *</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-2.5 text-xs text-gray-900 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">PRICE (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">SALE PRICE (LKR - OPTIONAL)</label>
                  <input
                    type="number"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                    placeholder="Leave blank for regular price"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">INITIAL STOCK *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">MAIN IMAGE URL *</label>
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={prodMainImage}
                      onChange={(e) => setProdMainImage(e.target.value)}
                      placeholder="https://... or upload image file below"
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none font-mono"
                    />
                    <label className="bg-[#111111] hover:bg-[#E63946] text-white text-[9px] font-bold tracking-widest px-3 py-2 cursor-pointer uppercase inline-flex items-center justify-center gap-1.5 transition-colors self-start shadow-xs">
                      <Upload size={12} />
                      {uploadingImage ? 'UPLOADING TO SUPABASE STORAGE...' : '📁 UPLOAD IMAGE FILE FROM COMPUTER'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'product')}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">SIZES OPTIONS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  required
                  value={prodSizesString}
                  onChange={(e) => setProdSizesString(e.target.value)}
                  placeholder="S,M,L,XL,XXL"
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">COLORS HEX CONFIG (NAME:HEX,NAME:HEX)</label>
                <input
                  type="text"
                  required
                  value={prodColorsString}
                  onChange={(e) => setProdColorsString(e.target.value)}
                  placeholder="Pitch Black:#111111,Chalk White:#FAFAFA"
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">PRODUCT DETAILS / SPECIFICATIONS</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none uppercase resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">FABRIC WEIGHTS & FEEL</label>
                  <input
                    type="text"
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">LAUNDRY PRESERVATIONS</label>
                  <input
                    type="text"
                    value={prodCare}
                    onChange={(e) => setProdCare(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[10px] tracking-wide text-gray-900">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                  />
                  CURATED ON HOMEPAGE (FEATURED)
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[10px] tracking-wide text-gray-900">
                  <input
                    type="checkbox"
                    checked={prodNewArrival}
                    onChange={(e) => setProdNewArrival(e.target.checked)}
                  />
                  NEW INCOMING DROP ARRIVAL
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowProductForm(false)}
                className="bg-transparent border border-gray-200 hover:border-black text-gray-700 py-2 px-4 text-[10px] font-bold tracking-widest uppercase cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="bg-black hover:bg-[#E63946] text-white py-2 px-5 text-[10px] font-bold tracking-widest uppercase cursor-pointer"
              >
                SAVE IN storefront
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- DYNAMIC CATEGORY CREATE/EDIT MODAL --- */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowCategoryForm(false)}></div>
          
          <form onSubmit={handleCategorySubmit} className="bg-white border border-gray-100 shadow-2xl relative z-50 w-full max-w-md flex flex-col uppercase font-mono tracking-wider text-xs text-gray-600">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="font-bold text-gray-900">{catFormMode === 'add' ? 'ADD COLLECTION CATEGORY' : 'EDIT COLLECTION CATEGORY'}</span>
              <button type="button" onClick={() => setShowCategoryForm(false)}><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">CATEGORY NAME *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (catFormMode === 'add') {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                    }
                  }}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none uppercase"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">CATEGORY SLUG *</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none lowercase font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none uppercase resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">SORT ORDER</label>
                  <input
                    type="number"
                    required
                    value={catOrder}
                    onChange={(e) => setCatOrder(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">STATUS</label>
                  <select
                    value={catStatus}
                    onChange={(e) => setCatStatus(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-2 text-xs text-gray-900 outline-none"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="inactive">INACTIVE</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end bg-gray-50">
              <button type="button" onClick={() => setShowCategoryForm(false)} className="bg-transparent border border-gray-200 hover:border-black text-gray-700 py-2 px-4 text-[10px] font-bold tracking-widest uppercase">CANCEL</button>
              <button type="submit" className="bg-black hover:bg-red-600 text-white py-2 px-5 text-[10px] font-bold tracking-widest uppercase">SAVE CATEGORY</button>
            </div>
          </form>
        </div>
      )}

      {/* --- DYNAMIC HERO BANNERS CREATE/EDIT MODAL --- */}
      {showBannerForm && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowBannerForm(false)}></div>
          
          <form onSubmit={handleBannerSubmit} className="bg-white border border-gray-100 shadow-2xl relative z-50 w-full max-w-md flex flex-col uppercase font-mono tracking-wider text-xs text-gray-600">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="font-bold text-gray-900">{bannerFormMode === 'add' ? 'ADD HERO BANNER' : 'EDIT HERO BANNER'}</span>
              <button type="button" onClick={() => setShowBannerForm(false)}><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">BANNER TITLE *</label>
                <input
                  type="text"
                  required
                  value={banTitle}
                  onChange={(e) => setBanTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none uppercase"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">SUBTITLE *</label>
                <input
                  type="text"
                  required
                  value={banSubtitle}
                  onChange={(e) => setBanSubtitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none uppercase"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">IMAGE URL *</label>
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    required
                    value={banImage}
                    onChange={(e) => setBanImage(e.target.value)}
                    placeholder="https://... or upload image file below"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none font-mono"
                  />
                  <label className="bg-[#111111] hover:bg-[#E63946] text-white text-[9px] font-bold tracking-widest px-3 py-2 cursor-pointer uppercase inline-flex items-center justify-center gap-1.5 transition-colors self-start shadow-xs">
                    <Upload size={12} />
                    {uploadingImage ? 'UPLOADING TO SUPABASE...' : '📁 UPLOAD BANNER FILE FROM COMPUTER'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'banner')}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">LINK REDIRECT URL</label>
                <input
                  type="text"
                  required
                  value={banLink}
                  onChange={(e) => setBanLink(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">BUTTON LABEL</label>
                  <input
                    type="text"
                    required
                    value={banText}
                    onChange={(e) => setBanText(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-gray-500 block mb-1">SORT ORDER</label>
                  <input
                    type="number"
                    required
                    value={banOrder}
                    onChange={(e) => setBanOrder(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none py-2 px-3 text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end bg-gray-50">
              <button type="button" onClick={() => setShowBannerForm(false)} className="bg-transparent border border-gray-200 hover:border-black text-gray-700 py-2 px-4 text-[10px] font-bold tracking-widest uppercase">CANCEL</button>
              <button type="submit" className="bg-black hover:bg-red-600 text-white py-2 px-5 text-[10px] font-bold tracking-widest uppercase">SAVE BANNER</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
