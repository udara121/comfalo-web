import express from 'express';
import path from 'path';
import { DB, hashPassword } from './server/db';
import { User, Category, Product, Order, OrderItem, Banner, SiteSettings } from './src/types';
import { supabase } from './src/lib/supabase';
import { migrateLocalDbToSupabase } from './server/migrate';

// Initialize local JSON DB
DB.init();

export const app = express();
const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Simple Session Authorization Middleware (Checks token/user-id passed via headers)
  const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(418).json({ error: 'Unauthorized: Missing session headers' });
    }
    const db = DB.get();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    (req as any).user = user;
    next();
  };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    authenticateUser(req, res, () => {
      const user = (req as any).user as User;
      if (user.userType !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      next();
    });
  };

  // --- API ROUTES ---

  // 1-Click Supabase Migration Endpoint
  app.post('/api/admin/migrate-supabase', requireAdmin, async (req, res) => {
    try {
      const summary = await migrateLocalDbToSupabase();
      res.json({ message: 'Migration executed successfully', summary });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Migration error' });
    }
  });

  // Site Settings
  app.get('/api/settings', (req, res) => {
    const db = DB.get();
    res.json(db.settings);
  });

  app.put('/api/settings', requireAdmin, (req, res) => {
    const db = DB.get();
    db.settings = { ...db.settings, ...req.body };
    DB.save();
    res.json({ message: 'Settings updated successfully', settings: db.settings });
  });

  // Banners
  app.get('/api/banners', (req, res) => {
    const db = DB.get();
    const activeBanners = db.banners.filter(b => b.status === 'active');
    res.json(activeBanners);
  });

  app.get('/api/admin/banners', requireAdmin, (req, res) => {
    const db = DB.get();
    res.json(db.banners);
  });

  app.post('/api/admin/banners', requireAdmin, (req, res) => {
    const db = DB.get();
    const newBanner: Banner = {
      id: 'banner-' + Date.now(),
      title: req.body.title || '',
      subtitle: req.body.subtitle || '',
      image: req.body.image || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600',
      linkUrl: req.body.linkUrl || '/shop',
      buttonText: req.body.buttonText || 'SHOP NOW',
      sortOrder: Number(req.body.sortOrder) || 0,
      status: req.body.status || 'active',
      createdAt: new Date().toISOString(),
    };
    db.banners.push(newBanner);
    db.banners.sort((a, b) => a.sortOrder - b.sortOrder);
    DB.save();
    res.status(201).json(newBanner);
  });

  app.put('/api/admin/banners/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    const index = db.banners.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    db.banners[index] = {
      ...db.banners[index],
      ...req.body,
    };
    db.banners.sort((a, b) => a.sortOrder - b.sortOrder);
    DB.save();
    res.json(db.banners[index]);
  });

  app.delete('/api/admin/banners/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    const index = db.banners.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    db.banners.splice(index, 1);
    DB.save();
    res.json({ message: 'Banner deleted successfully' });
  });

  // Auth
  app.post('/api/auth/register', (req, res) => {
    const { fullName, email, password, phone, whatsapp, address, city, district } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = DB.get();
    const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      fullName,
      email: email.toLowerCase(),
      password: hashPassword(password),
      phone: phone || '',
      whatsapp: whatsapp || '',
      address: address || '',
      city: city || '',
      district: district || 'Colombo',
      userType: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    DB.save();

    // Clean sensitive fields before responding
    const { password: _, ...cleanUser } = newUser;
    res.status(201).json({ message: 'Registration successful', user: cleanUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = DB.get();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hashed = hashPassword(password);
    if (user.password !== hashed) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Your account has been deactivated' });
    }

    const { password: _, ...cleanUser } = user;
    res.json({ message: 'Login successful', user: cleanUser });
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    const db = DB.get();
    const activeCategories = db.categories.filter(c => c.status === 'active');
    res.json(activeCategories);
  });

  app.get('/api/admin/categories', requireAdmin, (req, res) => {
    const db = DB.get();
    res.json(db.categories);
  });

  app.post('/api/admin/categories', requireAdmin, (req, res) => {
    const db = DB.get();
    const { name, slug, description, image, parentId, sortOrder, status } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }
    const exists = db.categories.some(c => c.slug === slug);
    if (exists) {
      return res.status(400).json({ error: 'Slug must be unique' });
    }

    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name,
      slug,
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      status: status || 'active',
      createdAt: new Date().toISOString(),
    };

    db.categories.push(newCategory);
    db.categories.sort((a, b) => a.sortOrder - b.sortOrder);
    DB.save();
    res.status(201).json(newCategory);
  });

  app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    const index = db.categories.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.categories[index] = {
      ...db.categories[index],
      ...req.body,
    };
    db.categories.sort((a, b) => a.sortOrder - b.sortOrder);
    DB.save();
    res.json(db.categories[index]);
  });

  // Helper to map Supabase database row to Product type
  function mapSupabaseProduct(row: any): Product {
    let sizes = row.sizes;
    if (typeof sizes === 'string') {
      try { sizes = JSON.parse(sizes); } catch (e) { sizes = ['S', 'M', 'L']; }
    }
    let colors = row.colors;
    if (typeof colors === 'string') {
      try { colors = JSON.parse(colors); } catch (e) { colors = [{ name: 'Black', hex: '#111111' }]; }
    }
    let galleryImages = row.gallery_images;
    if (typeof galleryImages === 'string') {
      try { galleryImages = JSON.parse(galleryImages); } catch (e) { galleryImages = [row.main_image]; }
    }

    return {
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      slug: row.slug,
      sku: row.sku || '',
      description: row.description || '',
      price: Number(row.price),
      salePrice: row.sale_price ? Number(row.sale_price) : null,
      sizes: Array.isArray(sizes) ? sizes : ['S', 'M', 'L'],
      colors: Array.isArray(colors) ? colors : [{ name: 'Black', hex: '#111111' }],
      stockQuantity: Number(row.stock_quantity) || 0,
      mainImage: row.main_image || '',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [row.main_image],
      fabricDetails: row.fabric_details || '',
      careInstructions: row.care_instructions || '',
      featured: !!row.featured,
      isNewArrival: !!row.is_new_arrival,
      views: Number(row.views) || 0,
      status: row.status || 'active',
      createdAt: row.created_at || new Date().toISOString()
    };
  }

  // Products List (supports filtering and searching)
  app.get('/api/products', async (req, res) => {
    let list: Product[] = [];
    try {
      const { data, error } = await supabase.from('products').select('*').neq('status', 'inactive');
      if (!error && data && data.length > 0) {
        list = data.map(mapSupabaseProduct);
      }
    } catch (e) {
      console.warn('Supabase products fetch warning:', e);
    }

    if (list.length === 0) {
      const db = DB.get();
      list = db.products.filter(p => p.status !== 'inactive');
    }

    const { category, search, size, minPrice, maxPrice, sort } = req.query;

    // Filter by Category
    if (category) {
      if (category === 'sale') {
        list = list.filter(p => p.salePrice !== null && p.salePrice !== undefined);
      } else if (category === 'new-arrivals') {
        list = list.filter(p => p.isNewArrival);
      } else {
        const catObj = DB.get().categories.find(c => c.slug === category);
        if (catObj) {
          list = list.filter(p => p.categoryId === catObj.id);
        }
      }
    }

    // Search
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Size filter
    if (size) {
      const s = size as string;
      list = list.filter(p => p.sizes.includes(s));
    }

    // Price filters
    if (minPrice) {
      const min = Number(minPrice);
      list = list.filter(p => (p.salePrice || p.price) >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      list = list.filter(p => (p.salePrice || p.price) <= max);
    }

    // Sort
    if (sort) {
      if (sort === 'price-low') {
        list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      } else if (sort === 'price-high') {
        list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      } else if (sort === 'newest') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sort === 'popular') {
        list.sort((a, b) => b.views - a.views);
      }
    } else {
      // Default sort by newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(list);
  });

  // Admin Products List (Fetches directly from Supabase Cloud DB)
  app.get('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const products = data.map(mapSupabaseProduct);
        return res.json(products);
      }
    } catch (e) {
      console.warn('Supabase admin products fetch warning:', e);
    }
    const db = DB.get();
    res.json(db.products);
  });

  // Single product detail (by slug or ID)
  app.get('/api/products/:slug', (req, res) => {
    const db = DB.get();
    const product = db.products.find(p => p.slug === req.params.slug || p.id === req.params.slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count dynamically!
    product.views = (product.views || 0) + 1;
    DB.save();

    res.json(product);
  });

  const syncProductToSupabase = async (prod: Product) => {
    try {
      const { error } = await supabase.from('products').upsert({
        id: prod.id,
        category_id: prod.categoryId,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description || '',
        price: prod.price,
        sale_price: prod.salePrice || null,
        sizes: prod.sizes,
        colors: prod.colors,
        stock_quantity: prod.stockQuantity,
        main_image: prod.mainImage,
        gallery_images: prod.galleryImages,
        fabric_details: prod.fabricDetails || '',
        care_instructions: prod.careInstructions || '',
        featured: prod.featured,
        is_new_arrival: prod.isNewArrival,
        views: prod.views || 0,
        status: prod.status || 'active',
        created_at: prod.createdAt || new Date().toISOString()
      });
      if (error) console.warn('Supabase product upsert note:', error.message);
    } catch (e: any) {
      console.warn('Supabase product sync warning:', e?.message || e);
    }
  };

  const deleteProductFromSupabase = async (prodId: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', prodId);
      if (error) console.warn('Supabase product delete note:', error.message);
    } catch (e: any) {
      console.warn('Supabase product delete warning:', e?.message || e);
    }
  };

  // Admin Add Product
  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const db = DB.get();
    const { name, slug, categoryId, sku, description, price, salePrice, sizes, colors, stockQuantity, mainImage, galleryImages, fabricDetails, careInstructions, featured, isNewArrival } = req.body;

    if (!name || !slug || !categoryId || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const exists = db.products.some(p => p.slug === slug);
    if (exists) {
      return res.status(400).json({ error: 'Slug must be unique' });
    }

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      categoryId,
      name,
      slug,
      sku: sku || 'CMF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      description: description || '',
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      sizes: Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(colors) ? colors : [{ name: 'Black', hex: '#111111' }],
      stockQuantity: Number(stockQuantity) || 0,
      mainImage: mainImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [mainImage],
      fabricDetails: fabricDetails || '',
      careInstructions: careInstructions || '',
      featured: !!featured,
      isNewArrival: !!isNewArrival,
      views: 0,
      status: Number(stockQuantity) > 0 ? 'active' : 'out_of_stock',
      createdAt: new Date().toISOString(),
    };

    db.products.push(newProduct);
    DB.save();

    // Live Sync with Supabase Cloud Database Table in background
    syncProductToSupabase(newProduct).catch(err => console.warn('Sync error:', err));

    res.status(201).json(newProduct);
  });

  // Admin Edit Product
  app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = {
      ...db.products[index],
      ...req.body,
      price: Number(req.body.price),
      salePrice: req.body.salePrice ? Number(req.body.salePrice) : null,
      stockQuantity: Number(req.body.stockQuantity),
    };

    // Auto update status if stock changes
    if (updated.stockQuantity > 0 && updated.status === 'out_of_stock') {
      updated.status = 'active';
    } else if (updated.stockQuantity <= 0) {
      updated.status = 'out_of_stock';
    }

    db.products[index] = updated;
    DB.save();

    // Live Sync with Supabase Cloud Database Table in background
    syncProductToSupabase(updated).catch(err => console.warn('Sync error:', err));

    res.json(updated);
  });

  // Admin Delete Product
  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    db.products.splice(index, 1);
    DB.save();

    // Live Delete from Supabase Cloud Database Table in background
    deleteProductFromSupabase(req.params.id).catch(err => console.warn('Delete error:', err));

    res.json({ message: 'Product deleted permanently' });
  });

  // Order Placement
  app.post('/api/orders', (req, res) => {
    const db = DB.get();
    const {
      userId,
      customerName,
      customerPhone,
      customerWhatsapp,
      customerEmail,
      shippingAddress,
      city,
      district,
      paymentMethod,
      items, // Array of { productId, size, color, quantity }
      notes
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !city || !district || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing shipping details or order items.' });
    }

    // Calculate subtotals & Verify Stock
    let subtotal = 0;
    const orderItemsToCreate: OrderItem[] = [];

    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}. Only ${product.stockQuantity} remaining.` });
      }

      const unitPrice = product.salePrice || product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItemsToCreate.push({
        id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        orderId: '', // To be filled after order id is generated
        productId: product.id,
        productName: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });

      // Deduct stock quantity!
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity <= 0) {
        product.status = 'out_of_stock';
      }
    }

    // Delivery fee auto-calculation
    // Colombo/Gampaha/Kalutara = Colombo Region (colombo_fee), others = outstation
    const colomboRegion = ['colombo', 'gampaha', 'kalutara'];
    const isColombo = colomboRegion.includes(district.toLowerCase());
    const deliveryFeeRate = isColombo ? db.settings.deliveryFeeColombo : db.settings.deliveryFeeOutstation;
    
    // Free delivery threshold check
    const deliveryFee = subtotal >= db.settings.freeDeliveryThreshold ? 0 : deliveryFeeRate;
    const total = subtotal + deliveryFee;

    // Generate Order Number: CMF-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todaysOrdersCount = db.orders.filter(o => o.orderNumber.startsWith(`CMF-${dateStr}`)).length;
    const orderSeq = String(todaysOrdersCount + 1).padStart(4, '0');
    const orderNumber = `CMF-${dateStr}-${orderSeq}`;

    const orderId = 'ord-' + Date.now();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: userId || null,
      customerName,
      customerPhone,
      customerWhatsapp: customerWhatsapp || customerPhone,
      customerEmail: customerEmail || '',
      shippingAddress,
      city,
      district,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      orderStatus: 'pending',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    // Set orderId in order items
    orderItemsToCreate.forEach(oi => oi.orderId = orderId);

    // Save order & items
    db.orders.push(newOrder);
    db.orderItems.push(...orderItemsToCreate);
    DB.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        ...newOrder,
        items: orderItemsToCreate
      }
    });
  });

  // Order Tracking
  app.get('/api/orders/track', (req, res) => {
    const { number, phone } = req.query;
    if (!number || !phone) {
      return res.status(400).json({ error: 'Order number and phone are required for tracking' });
    }

    const db = DB.get();
    const order = db.orders.find(o => 
      o.orderNumber.toLowerCase() === (number as string).trim().toLowerCase() &&
      o.customerPhone.replace(/[\s\+\-]/g, '').endsWith((phone as string).replace(/[\s\+\-]/g, '').slice(-9))
    );

    if (!order) {
      return res.status(404).json({ error: 'No matching order found with the provided details' });
    }

    const items = db.orderItems.filter(oi => oi.orderId === order.id);
    res.json({
      ...order,
      items
    });
  });

  // Admin Order List
  app.get('/api/admin/orders', requireAdmin, (req, res) => {
    const db = DB.get();
    const list = db.orders.map(o => {
      const items = db.orderItems.filter(oi => oi.orderId === o.id);
      return {
        ...o,
        items
      };
    });
    // Sort orders from newest to oldest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
  });

  // Customer Order History
  app.get('/api/orders/user/:userId', authenticateUser, (req, res) => {
    if ((req as any).user.id !== req.params.userId && (req as any).user.userType !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const db = DB.get();
    const orders = db.orders.filter(o => o.userId === req.params.userId).map(o => {
      const items = db.orderItems.filter(oi => oi.orderId === o.id);
      return {
        ...o,
        items
      };
    });
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(orders);
  });

  // Admin View Single Order
  app.get('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const items = db.orderItems.filter(oi => oi.orderId === order.id);
    res.json({
      ...order,
      items
    });
  });

  // Admin Update Order Status
  app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
    const db = DB.get();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldStatus = order.orderStatus;
    const { status } = req.body;
    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    order.orderStatus = status;

    // If order is cancelled, we should return the stock back to products!
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const items = db.orderItems.filter(oi => oi.orderId === order.id);
      for (const item of items) {
        const product = db.products.find(p => p.id === item.productId);
        if (product) {
          product.stockQuantity += item.quantity;
          if (product.status === 'out_of_stock' && product.stockQuantity > 0) {
            product.status = 'active';
          }
        }
      }
    }
    // If order is restored from cancelled, deduct stock again
    else if (oldStatus === 'cancelled' && status !== 'cancelled') {
      const items = db.orderItems.filter(oi => oi.orderId === order.id);
      for (const item of items) {
        const product = db.products.find(p => p.id === item.productId);
        if (product) {
          product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          if (product.stockQuantity <= 0) {
            product.status = 'out_of_stock';
          }
        }
      }
    }

    DB.save();
    res.json({ message: 'Order status updated successfully', orderStatus: order.orderStatus });
  });

  // Admin Customer List
  app.get('/api/admin/customers', requireAdmin, (req, res) => {
    const db = DB.get();
    const customers = db.users.filter(u => u.userType === 'customer').map(u => {
      const orders = db.orders.filter(o => o.userId === u.id);
      const totalSpent = orders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.total : 0), 0);
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        whatsapp: u.whatsapp,
        address: u.address,
        city: u.city,
        district: u.district,
        status: u.status,
        createdAt: u.createdAt,
        ordersCount: orders.length,
        totalSpent
      };
    });
    res.json(customers);
  });

  // Admin View Customer Detail (with their orders)
  app.get('/api/admin/customers/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    const customer = db.users.find(u => u.id === req.params.id && u.userType === 'customer');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const orders = db.orders.filter(o => o.userId === customer.id).map(o => {
      const items = db.orderItems.filter(oi => oi.orderId === o.id);
      return {
        ...o,
        items
      };
    });
    const { password: _, ...cleanCustomer } = customer;
    res.json({
      customer: cleanCustomer,
      orders
    });
  });

  // Admin Toggle Customer Status
  app.put('/api/admin/customers/:id/status', requireAdmin, (req, res) => {
    const db = DB.get();
    const customer = db.users.find(u => u.id === req.params.id && u.userType === 'customer');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    customer.status = req.body.status === 'active' ? 'active' : 'inactive';
    DB.save();
    res.json({ message: `Customer status updated to ${customer.status}`, status: customer.status });
  });

  // Global Error Handler Middleware to ensure clean JSON responses instead of HTML 500 pages
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Express API Error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

// Static serving for build output and Vite Dev Middleware (Local Server Only)
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  async function startLocalServer() {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }

  startLocalServer().catch(err => {
    console.error('Failed to start Express backend:', err);
  });
}
