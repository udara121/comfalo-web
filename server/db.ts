import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Category, Product, Order, OrderItem, Banner, SiteSettings } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Helper to hash password
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
  banners: Banner[];
  settings: SiteSettings;
}

// Initial/Seed Data
const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Comfalo',
  siteTagline: 'Comfort. Style. You.',
  contactEmail: 'hello@comfalo.lk',
  contactPhone: '0753237633',
  whatsappNumber: '94753237633',
  deliveryFeeColombo: 350,
  deliveryFeeOutstation: 450,
  freeDeliveryThreshold: 7500,
  facebookUrl: 'https://www.facebook.com/share/1G3Tfp6opm/?mibextid=wwXIfr',
  instagramUrl: 'https://instagram.com/comfalo.lk',
  tiktokUrl: 'https://tiktok.com/@comfalo.lk',
};

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-men',
    name: 'Men',
    slug: 'men',
    description: "Premium streetwear and everyday comfort engineered for men.",
    sortOrder: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-women',
    name: 'Women',
    slug: 'women',
    description: "Designed for effortless elegance and modern streetwear fits for women.",
    sortOrder: 2,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-unisex',
    name: 'Unisex',
    slug: 'unisex',
    description: "Oversized silhouettes and cozy basics crafted to fit everyone.",
    sortOrder: 3,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: "Complete your look with our premium caps, socks, and minimalist tote bags.",
    sortOrder: 4,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-new-arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: "Explore the freshest drops and latest street fashion designs.",
    sortOrder: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-sale',
    name: 'Sale',
    slug: 'sale',
    description: "Limited stock of premium comfort wear at discounted prices.",
    sortOrder: 6,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'THE OVERSIZED REVOLUTION',
    subtitle: 'Drop 04 is now live. Premium heavyweight cotton garments designed for ultimate comfort and durability.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&auto=format&fit=crop&q=80',
    linkUrl: '/shop?category=unisex',
    buttonText: 'SHOP HEAVYWEIGHT TEES',
    sortOrder: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-2',
    title: 'SIGNATURE HOODIES',
    subtitle: 'Luxury 400GSM fleece essentials. Generous double-lined hoods, perfect drop shoulders, and snug ribbing.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&auto=format&fit=crop&q=80',
    linkUrl: '/shop?category=men',
    buttonText: 'EXPLORE HOODIES',
    sortOrder: 2,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-3',
    title: 'STREET ACCENTS',
    subtitle: 'Elevate your everyday aesthetic with our luxury unstructured canvas caps and utility tote bags.',
    image: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?w=1600&auto=format&fit=crop&q=80',
    linkUrl: '/shop?category=accessories',
    buttonText: 'BROWSE ACCESSORIES',
    sortOrder: 3,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    categoryId: 'cat-unisex',
    name: 'Heavyweight Signature Oversized Tee',
    slug: 'heavyweight-signature-oversized-tee',
    sku: 'CMF-TS-001',
    description: 'Crafted from 240GSM 100% premium combed cotton, our Heavyweight Signature Tee features an intentional oversized boxy fit, dropped shoulders, and a thick ribbed collar that won\'t stretch over time. Engineered to hold its structure, this piece is the ultimate modern streetwear wardrobe essential.',
    price: 3450,
    salePrice: 2950,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Pitch Black', hex: '#111111' },
      { name: 'Chalk White', hex: '#FAFAFA' },
      { name: 'Sage Green', hex: '#6E7E6E' }
    ],
    stockQuantity: 45,
    mainImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% Combed Heavyweight Cotton, 240GSM. Pre-shrunk for minimal shrinkage. Double-needle stitched hems.',
    careInstructions: 'Machine wash cold inside out with similar colors. Hang dry in shade. Warm iron inside out. Do not tumble dry, bleach, or dry clean.',
    featured: true,
    isNewArrival: true,
    views: 128,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    categoryId: 'cat-men',
    name: 'Downtown Heavyweight Fleece Hoodie',
    slug: 'downtown-heavyweight-fleece-hoodie',
    sku: 'CMF-HD-002',
    description: 'Our Downtown Fleece Hoodie is cut from 380GSM ultra-soft brushback fleece. It has a generous double-layered hood without drawcords for a clean, minimalist face, deep kangaroo front pocket, side rib panels for a comfortable wide range of motion, and snug custom-milled ribbed cuffs.',
    price: 6850,
    salePrice: null,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal Grey', hex: '#4A4A4A' },
      { name: 'Pitch Black', hex: '#111111' }
    ],
    stockQuantity: 18,
    mainImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '80% Premium Cotton, 20% Polyester Fleece Blend, 380GSM. Extremely soft brushed interior.',
    careInstructions: 'Wash cold inside out. Tumble dry on lowest setting or hang dry. Do not iron the graphic if applicable.',
    featured: true,
    isNewArrival: true,
    views: 94,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    categoryId: 'cat-women',
    name: 'Minimalist Boxy Crop Sweater',
    slug: 'minimalist-boxy-crop-sweater',
    sku: 'CMF-SW-003',
    description: 'A stylish, cropped luxury sweater engineered for everyday versatility. Featuring a relaxed boxy fit, dropped shoulder seams, and raw-edge hem finishes for an effortlessly cool streetwear vibe. Styled elegantly with high-waist joggers or denim.',
    price: 4950,
    salePrice: 4250,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Cream Sand', hex: '#F0E6D2' },
      { name: 'Dusty Pink', hex: '#D2A1A8' }
    ],
    stockQuantity: 24,
    mainImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% Terry Cotton, 280GSM. Ultra-breathable, ideal for Sri Lankan climate loops.',
    careInstructions: 'Hand wash recommended or delicate machine cycle. Flat dry in shade to maintain crop structure.',
    featured: false,
    isNewArrival: false,
    views: 65,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    categoryId: 'cat-accessories',
    name: 'Comfalo Unstructured Canvas Cap',
    slug: 'comfalo-unstructured-canvas-cap',
    sku: 'CMF-CP-004',
    description: 'A vintage-inspired 6-panel unstructured strapback cap made from 100% washed cotton canvas. Features a custom Comfalo minimalist embroidery on the front panel, matching fabric strap with brass slider clasp, and a pre-curved brim for that relaxed, worn-in look.',
    price: 2250,
    salePrice: null,
    sizes: ['One Size'],
    colors: [
      { name: 'Coal Black', hex: '#222222' },
      { name: 'Forest Olive', hex: '#3B4D3B' },
      { name: 'Khaki Tan', hex: '#C2B280' }
    ],
    stockQuantity: 4, // Trigger low stock alert (stock < 5)
    mainImage: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% Washed Cotton Twill. Breathable embroidered eyelets.',
    careInstructions: 'Spot clean with damp cloth and mild soap. Air dry in shade. Do not machine wash or dry clean.',
    featured: true,
    isNewArrival: false,
    views: 210,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    categoryId: 'cat-unisex',
    name: 'Everyday Relaxed Cargo Joggers',
    slug: 'everyday-relaxed-cargo-joggers',
    sku: 'CMF-JG-005',
    description: 'Combining functional utility and cozy streetwear. Engineered with a relaxed tapered leg, dual spacious utility cargo pockets with snaps, deep side slant pockets, elasticized cuffs, and an extra-thick elastic waistband with robust drawstring cords.',
    price: 5250,
    salePrice: 4750,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Desert Sand', hex: '#D2B48C' },
      { name: 'Pitch Black', hex: '#111111' },
      { name: 'Military Olive', hex: '#4B5320' }
    ],
    stockQuantity: 32,
    mainImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '70% Cotton, 30% Polyester heavy interlock blend, 320GSM.',
    careInstructions: 'Wash inside out with drawcords tied. Low heat drying. Iron at low temperature.',
    featured: true,
    isNewArrival: true,
    views: 142,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    categoryId: 'cat-unisex',
    name: 'Core Premium Boxy Tee',
    slug: 'core-premium-boxy-tee',
    sku: 'CMF-TS-006',
    description: 'Our standard-weight core premium tee. Cut in a contemporary boxy block with drop shoulders. Offers a comfortable, airy feel in Sri Lankan climates without compromising on fabric premium thickness.',
    price: 2950,
    salePrice: null,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pebble Grey', hex: '#BEBEBE' },
      { name: 'Navy Blue', hex: '#1D2A44' },
      { name: 'Chalk White', hex: '#FAFAFA' }
    ],
    stockQuantity: 50,
    mainImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% Combed Cotton, 200GSM.',
    careInstructions: 'Machine wash with cold water. Avoid harsh detergents. Do not wring or tumble dry.',
    featured: false,
    isNewArrival: true,
    views: 45,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    categoryId: 'cat-women',
    name: 'Boyfriend Fit Oversized Tee',
    slug: 'boyfriend-fit-oversized-tee',
    sku: 'CMF-TS-007',
    description: 'An elegant oversized tee cut with custom specifications for women who love the boxy skater aesthetic. Extended sleeves, dropped shoulders, and a flattering relaxed neckline that stays sits beautifully on the collarbone.',
    price: 3250,
    salePrice: 2850,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Chalk White', hex: '#FAFAFA' },
      { name: 'Sage Green', hex: '#6E7E6E' },
      { name: 'Charcoal Grey', hex: '#4A4A4A' }
    ],
    stockQuantity: 15,
    mainImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% Combed ringspun cotton, 210GSM. Smooth combed finish.',
    careInstructions: 'Cold gentle cycle. Dry flat. Iron at medium setting.',
    featured: false,
    isNewArrival: false,
    views: 89,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    categoryId: 'cat-accessories',
    name: 'Heavyweight Canvas Logo Tote',
    slug: 'heavyweight-canvas-logo-tote',
    sku: 'CMF-BG-008',
    description: 'Our heavy-duty multi-purpose shopping and daily commuter tote bag. Made from stiff 14oz unbleached cotton canvas with double-stitched straps, internal divider pocket for keys and phone, and printed with Comfalo\'s signature minimal branding.',
    price: 1950,
    salePrice: 1650,
    sizes: ['One Size'],
    colors: [
      { name: 'Natural Canvas', hex: '#F2E8DF' },
      { name: 'Pitch Black', hex: '#111111' }
    ],
    stockQuantity: 3, // Trigger low stock alert
    mainImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% 14oz Cotton Canvas. Reinforced shoulder strapping.',
    careInstructions: 'Spot clean only. Avoid soaking canvas as shrinkage may occur.',
    featured: false,
    isNewArrival: false,
    views: 52,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    categoryId: 'cat-men',
    name: 'Vintage Wash Panel Windbreaker',
    slug: 'vintage-wash-panel-windbreaker',
    sku: 'CMF-JK-009',
    description: 'A high-performance luxury streetwear outerwear piece. Made of highly water-resistant crinkle nylon shell, panelled retro-blocking design, custom YKK full-zip front, elasticated waistband, and high neck collar with hideaway hood.',
    price: 7950,
    salePrice: null,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Coal Black / Olive', hex: '#1F2A1F' }
    ],
    stockQuantity: 12,
    mainImage: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% Crinkle Nylon Shell, Lightweight Mesh Interior Lining.',
    careInstructions: 'Hand wash cold or gentle machine wash inside a laundry bag. Do not tumble dry or iron.',
    featured: true,
    isNewArrival: false,
    views: 114,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    categoryId: 'cat-women',
    name: 'Signature High-Waist Sweatshorts',
    slug: 'signature-high-waist-sweatshorts',
    sku: 'CMF-SH-010',
    description: 'Ultra-cozy loungewear sweatshorts featuring a retro athletic side slit, ultra-thick premium waistband with flat internal drawstring, and a secure back pocket. Matches perfectly with our minimalist crop sweaters.',
    price: 3850,
    salePrice: 3250,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Cream Sand', hex: '#F0E6D2' },
      { name: 'Sage Green', hex: '#6E7E6E' },
      { name: 'Pitch Black', hex: '#111111' }
    ],
    stockQuantity: 20,
    mainImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '80% Cotton, 20% Polyester Premium Loopback Terry, 300GSM.',
    careInstructions: 'Wash inside out with cold water. Air dry. Iron on lowest cotton setting.',
    featured: false,
    isNewArrival: false,
    views: 40,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-11',
    categoryId: 'cat-unisex',
    name: 'Downtown Comfort Fleece Crewneck',
    slug: 'downtown-comfort-fleece-crewneck',
    sku: 'CMF-SW-011',
    description: 'Relaxed and premium. Cut from 360GSM heavy loopback knit, featuring tight ribbing at neck and waist that holds its elasticity, minimal flatlock stitching, and dropped shoulders.',
    price: 5850,
    salePrice: 5250,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Heather Grey', hex: '#A9A9A9' },
      { name: 'Pitch Black', hex: '#111111' }
    ],
    stockQuantity: 15,
    mainImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% Heavy Premium Loopback Cotton, 360GSM.',
    careInstructions: 'Machine wash cold. Turn inside out before washing and ironing. Flat dry.',
    featured: false,
    isNewArrival: false,
    views: 48,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-12',
    categoryId: 'cat-men',
    name: 'Retro Ribbed Slouch Jogger',
    slug: 'retro-ribbed-slouch-jogger',
    sku: 'CMF-JG-012',
    description: 'An ultimate cozy pant with a retro relaxed slouch silhouette. Features heavy rib panels on side seams and waistband, concealed zippered hand pockets for phone safety, and thick ankle cuffing.',
    price: 5450,
    salePrice: null,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pitch Black', hex: '#111111' },
      { name: 'Heather Grey', hex: '#A9A9A9' }
    ],
    stockQuantity: 22,
    mainImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '75% Combed Cotton, 25% Poly Fleece Blend, 340GSM.',
    careInstructions: 'Wash cold inside out. Low dry or hang dry. Do not bleach.',
    featured: false,
    isNewArrival: false,
    views: 59,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    fullName: 'Comfalo Admin',
    email: 'admin@comfalo.lk',
    password: hashPassword('Admin@123'),
    phone: '+94771234567',
    whatsapp: '94771234567',
    address: 'No 45, Flower Road',
    city: 'Colombo 07',
    district: 'Colombo',
    userType: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-customer-1',
    fullName: 'Dilshan Silva',
    email: 'dilshan@gmail.com',
    password: hashPassword('customer123'),
    phone: '0777654321',
    whatsapp: '94777654321',
    address: '12/A, Galle Road',
    city: 'Mount Lavinia',
    district: 'Colombo',
    userType: 'customer',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'CMF-20260715-0001',
    userId: 'user-customer-1',
    customerName: 'Dilshan Silva',
    customerPhone: '0777654321',
    customerWhatsapp: '94777654321',
    customerEmail: 'dilshan@gmail.com',
    shippingAddress: '12/A, Galle Road',
    city: 'Mount Lavinia',
    district: 'Colombo',
    subtotal: 6850,
    deliveryFee: 350,
    total: 7200,
    paymentMethod: 'cod',
    orderStatus: 'pending',
    notes: 'Please call before delivery.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'ord-2',
    orderNumber: 'CMF-20260714-0002',
    userId: null, // Guest checkout
    customerName: 'Anuki Fernando',
    customerPhone: '0712345678',
    customerWhatsapp: '94712345678',
    customerEmail: 'anuki.f@example.com',
    shippingAddress: 'No 158, Kandy Road',
    city: 'Kadawatha',
    district: 'Gampaha',
    subtotal: 7850,
    deliveryFee: 0, // Free delivery because subtotal > 7500
    total: 7850,
    paymentMethod: 'whatsapp',
    orderStatus: 'confirmed',
    notes: 'Leave at front gate security if not home.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
  }
];

const INITIAL_ORDER_ITEMS: OrderItem[] = [
  {
    id: 'item-1',
    orderId: 'ord-1',
    productId: 'prod-2',
    productName: 'Downtown Heavyweight Fleece Hoodie',
    size: 'L',
    color: 'Charcoal Grey',
    quantity: 1,
    unitPrice: 6850,
    lineTotal: 6850,
  },
  {
    id: 'item-2',
    orderId: 'ord-2',
    productId: 'prod-1',
    productName: 'Heavyweight Signature Oversized Tee',
    size: 'M',
    color: 'Pitch Black',
    quantity: 2,
    unitPrice: 2950,
    lineTotal: 5900,
  },
  {
    id: 'item-3',
    orderId: 'ord-2',
    productId: 'prod-8',
    productName: 'Heavyweight Canvas Logo Tote',
    size: 'One Size',
    color: 'Natural Canvas',
    quantity: 1,
    unitPrice: 1950,
    lineTotal: 1950,
  }
];

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;
const READ_ONLY_DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const WRITABLE_DB_FILE = isVercel ? path.join('/tmp', 'db.json') : READ_ONLY_DB_FILE;

export class DB {
  private static data: DatabaseSchema | null = null;

  public static init() {
    if (this.data) return;

    try {
      // On Vercel, copy initial db.json to /tmp/db.json if /tmp/db.json does not exist
      if (isVercel && !fs.existsSync(WRITABLE_DB_FILE)) {
        if (fs.existsSync(READ_ONLY_DB_FILE)) {
          try {
            const rawSeed = fs.readFileSync(READ_ONLY_DB_FILE, 'utf-8');
            fs.writeFileSync(WRITABLE_DB_FILE, rawSeed, 'utf-8');
          } catch (e) {
            console.warn('Could not copy read-only db.json to /tmp:', e);
          }
        }
      }

      if (!isVercel) {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
      }

      const targetFile = fs.existsSync(WRITABLE_DB_FILE)
        ? WRITABLE_DB_FILE
        : (fs.existsSync(READ_ONLY_DB_FILE) ? READ_ONLY_DB_FILE : null);

      if (targetFile && fs.existsSync(targetFile)) {
        const raw = fs.readFileSync(targetFile, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data?.users || !this.data?.products) {
          throw new Error('Malformed database file');
        }
        // Ensure critical seed arrays exist
        if (!this.data.categories || this.data.categories.length === 0) {
          this.data.categories = INITIAL_CATEGORIES;
        }
        if (!this.data.products || this.data.products.length === 0) {
          this.data.products = INITIAL_PRODUCTS;
        }
        if (!this.data.banners || this.data.banners.length === 0) {
          this.data.banners = INITIAL_BANNERS;
        }
        if (!this.data.settings) {
          this.data.settings = INITIAL_SETTINGS;
        }
      } else {
        this.seed();
      }
    } catch (err) {
      console.error('Error initializing DB, re-seeding...', err);
      this.seed();
    }
  }

  private static seed() {
    this.data = {
      users: INITIAL_USERS,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      orderItems: INITIAL_ORDER_ITEMS,
      banners: INITIAL_BANNERS,
      settings: INITIAL_SETTINGS,
    };
    this.save();
  }

  public static save() {
    if (!this.data) return;
    try {
      const targetPath = isVercel ? WRITABLE_DB_FILE : READ_ONLY_DB_FILE;
      fs.writeFileSync(targetPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database:', err);
    }
  }

  public static get(): DatabaseSchema {
    this.init();
    return this.data!;
  }
}
