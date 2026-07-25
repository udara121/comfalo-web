export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Hashed password, omitted in UI
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  district?: string;
  userType: 'admin' | 'customer';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentId?: string | null;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number | null;
  sizes: string[]; // ["S", "M", "L", "XL", "XXL"]
  colors: ColorOption[]; // [{"name": "Black", "hex": "#111"}]
  stockQuantity: number;
  mainImage: string;
  galleryImages: string[]; // JSON string array
  fabricDetails?: string;
  careInstructions?: string;
  featured: boolean;
  isNewArrival: boolean;
  views: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  customerEmail?: string;
  shippingAddress: string;
  city: string;
  district: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'whatsapp';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  items?: OrderItem[]; // Populated when viewing details
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  linkUrl: string;
  buttonText: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  deliveryFeeColombo: number;
  deliveryFeeOutstation: number;
  freeDeliveryThreshold: number;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}
