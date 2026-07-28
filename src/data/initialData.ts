import { SiteSettings, Category, Banner, Product } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
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

export const INITIAL_CATEGORIES: Category[] = [
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

export const INITIAL_BANNERS: Banner[] = [
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

export const INITIAL_PRODUCTS: Product[] = [
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
    description: 'A stylish, cropped luxury sweater engineered for everyday versatility. Featuring a relaxed boxy fit, dropped shoulder seams, and raw-edge hem finishes for an effortlessly cool streetwear vibe.',
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
    fabricDetails: '100% Terry Cotton, 280GSM.',
    careInstructions: 'Hand wash recommended or delicate machine cycle.',
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
    description: 'A vintage-inspired 6-panel unstructured strapback cap made from 100% washed cotton canvas.',
    price: 2250,
    salePrice: null,
    sizes: ['One Size'],
    colors: [
      { name: 'Coal Black', hex: '#222222' },
      { name: 'Forest Olive', hex: '#3B4D3B' }
    ],
    stockQuantity: 14,
    mainImage: 'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?w=800&auto=format&fit=crop&q=80'
    ],
    fabricDetails: '100% Washed Cotton Twill.',
    careInstructions: 'Spot clean with damp cloth.',
    featured: true,
    isNewArrival: false,
    views: 210,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    categoryId: 'cat-men',
    name: 'Vintage Wash Panel Windbreaker',
    slug: 'vintage-wash-panel-windbreaker',
    sku: 'CMF-JK-009',
    description: 'A high-performance luxury streetwear outerwear piece. Made of highly water-resistant crinkle nylon shell, panelled retro-blocking design, custom YKK full-zip front.',
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
    careInstructions: 'Hand wash cold or gentle machine wash.',
    featured: true,
    isNewArrival: false,
    views: 114,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];
