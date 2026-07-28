import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Category, SiteSettings, Product } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  image: string;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
}

interface AppContextType {
  cart: CartItem[];
  user: User | null;
  settings: SiteSettings | null;
  categories: Category[];
  loadingSettings: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  updateUserProfile: (updatedUser: Partial<User>) => void;
  cartSubtotal: number;
  cartCount: number;
  showCartDrawer: boolean;
  setShowCartDrawer: (show: boolean) => void;
  fetchSettings: () => Promise<void>;
  currentPath: string;
  navigateTo: (path: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  // Initialize: Load cart & user from localStorage, and fetch categories/settings
  useEffect(() => {
    // Load path from window location or default to /
    const path = window.location.hash ? window.location.hash.replace('#', '') : window.location.pathname;
    setCurrentPath(path || '/');

    // Handle hash change for simple client-side routing
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };
    window.addEventListener('hashchange', handleHashChange);

    const storedCart = localStorage.getItem('comfalo_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }

    const storedUser = localStorage.getItem('comfalo_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user');
      }
    }

    fetchSettingsAndCategories();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const fetchSettingsAndCategories = async () => {
    try {
      setLoadingSettings(true);
      
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      }

      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(INITIAL_CATEGORIES);
        }
      } else {
        setCategories(INITIAL_CATEGORIES);
      }
    } catch (e) {
      console.error('Error fetching initial settings:', e);
      setCategories(INITIAL_CATEGORIES);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      // Check if item already exists with same size & color
      const existingIndex = prevCart.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.size === newItem.size &&
          i.color === newItem.color
      );

      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += newItem.quantity;
      } else {
        updatedCart = [...prevCart, newItem];
      }

      localStorage.setItem('comfalo_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
    // Open drawer to give instant feedback
    setShowCartDrawer(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (i) => !(i.productId === productId && i.size === size && i.color === color)
      );
      localStorage.setItem('comfalo_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const updateCartQty = (productId: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.map((i) => {
        if (i.productId === productId && i.size === size && i.color === color) {
          return { ...i, quantity: qty };
        }
        return i;
      });
      localStorage.setItem('comfalo_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('comfalo_cart');
  };

  // Auth operations
  const loginUser = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('comfalo_user', JSON.stringify(loggedInUser));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('comfalo_user');
    navigateTo('/');
  };

  const updateUserProfile = (updatedUser: Partial<User>) => {
    if (!user) return;
    const newProfile = { ...user, ...updatedUser };
    setUser(newProfile);
    localStorage.setItem('comfalo_user', JSON.stringify(newProfile));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        cart,
        user,
        settings,
        categories,
        loadingSettings,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        loginUser,
        logoutUser,
        updateUserProfile,
        cartSubtotal,
        cartCount,
        showCartDrawer,
        setShowCartDrawer,
        fetchSettings,
        currentPath,
        navigateTo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
