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
    let user = db.users.find(u => u.id === userId);
    if (!user && (userId === 'user-admin' || userId.includes('admin'))) {
      user = {
        id: 'user-admin',
        fullName: 'Comfalo Admin',
        email: 'admin@comfalo.lk',
        password: '',
        phone: '+94771234567',
        whatsapp: '94771234567',
        address: 'No 45, Flower Road',
        city: 'Colombo 07',
        district: 'Colombo',
        userType: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    }
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
  app.get('/api/settings', async (req, res) => {
    const db = DB.get();
    if (db.settings) {
      return res.json(db.settings);
    }
    try {
      const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
      if (!error && data) {
        return res.json({
          siteName: data.site_name,
          siteTagline: data.site_tagline,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
          whatsappNumber: data.whatsapp_number,
          deliveryFeeColombo: Number(data.delivery_fee_colombo),
          deliveryFeeOutstation: Number(data.delivery_fee_outstation),
          freeDeliveryThreshold: Number(data.free_delivery_threshold),
          facebookUrl: data.facebook_url,
          instagramUrl: data.instagram_url,
          tiktokUrl: data.tiktok_url
        });
      }
    } catch (e) {
      console.warn('Supabase settings fetch warning:', e);
    }
    res.json(db.settings);
  });

  app.put('/api/settings', requireAdmin, async (req, res) => {
    const db = DB.get();
    db.settings = { ...db.settings, ...req.body };
    DB.save();

    try {
      await supabase.from('settings').upsert({
        id: 1,
        site_name: db.settings.siteName,
        site_tagline: db.settings.siteTagline,
        contact_email: db.settings.contactEmail,
        contact_phone: db.settings.contactPhone,
        whatsapp_number: db.settings.whatsappNumber,
        delivery_fee_colombo: db.settings.deliveryFeeColombo,
        delivery_fee_outstation: db.settings.deliveryFeeOutstation,
        free_delivery_threshold: db.settings.freeDeliveryThreshold,
        facebook_url: db.settings.facebookUrl,
        instagram_url: db.settings.instagramUrl,
        tiktok_url: db.settings.tiktokUrl
      });
    } catch (e) {
      console.warn('Supabase settings sync warning:', e);
    }

    res.json({ message: 'Settings updated successfully', settings: db.settings });
  });

  // Banners
  app.get('/api/banners', async (req, res) => {
    const db = DB.get();
    if (db.banners && db.banners.length > 0) {
      const activeBanners = db.banners.filter(b => b.status === 'active');
      return res.json(activeBanners);
    }
    try {
      const { data, error } = await supabase.from('banners').select('*').eq('status', 'active').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const banners = data.map((b: any) => ({
          id: String(b.id),
          title: b.title,
          subtitle: b.subtitle,
          image: b.image,
          linkUrl: b.link_url,
          buttonText: b.button_text,
          sortOrder: Number(b.sort_order) || 0,
          status: b.status,
          createdAt: b.created_at || new Date().toISOString()
        }));
        return res.json(banners);
      }
    } catch (e) {
      console.warn('Supabase banners fetch warning:', e);
    }
    res.json([]);
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

    // Background sync to Supabase if connected
    Promise.resolve(supabase.from('banners').upsert({
      id: newBanner.id,
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      image: newBanner.image,
      link_url: newBanner.linkUrl,
      button_text: newBanner.buttonText,
      sort_order: newBanner.sortOrder,
      status: newBanner.status,
      created_at: newBanner.createdAt
    })).catch(() => {});

    res.status(201).json(newBanner);
  });

  app.put('/api/admin/banners/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    let index = db.banners.findIndex(b => String(b.id) === String(req.params.id));
    if (index === -1) {
      const newBanner: Banner = {
        id: req.params.id || 'banner-' + Date.now(),
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
      return res.json(newBanner);
    }
    db.banners[index] = {
      ...db.banners[index],
      ...req.body,
    };
    db.banners.sort((a, b) => a.sortOrder - b.sortOrder);
    DB.save();

    Promise.resolve(supabase.from('banners').upsert({
      id: db.banners[index].id,
      title: db.banners[index].title,
      subtitle: db.banners[index].subtitle,
      image: db.banners[index].image,
      link_url: db.banners[index].linkUrl,
      button_text: db.banners[index].buttonText,
      sort_order: db.banners[index].sortOrder,
      status: db.banners[index].status
    })).catch(() => {});

    res.json(db.banners[index]);
  });

  app.delete('/api/admin/banners/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    const index = db.banners.findIndex(b => String(b.id) === String(req.params.id));
    if (index !== -1) {
      db.banners.splice(index, 1);
      DB.save();
    }
    Promise.resolve(supabase.from('banners').delete().eq('id', req.params.id)).catch(() => {});
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
  app.get('/api/categories', async (req, res) => {
    const db = DB.get();
    if (db.categories && db.categories.length > 0) {
      return res.json(db.categories.filter(c => c.status === 'active'));
    }
    try {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const categories = data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image: c.image || '',
          parentId: c.parent_id || null,
          sortOrder: Number(c.sort_order) || 0,
          status: c.status || 'active',
          createdAt: c.created_at || new Date().toISOString()
        }));
        return res.json(categories.filter((c: any) => c.status === 'active'));
      }
    } catch (e) {
      console.warn('Supabase categories fetch warning:', e);
    }
    res.json([]);
  });

  app.get('/api/admin/categories', requireAdmin, (req, res) => {
    const db = DB.get();
    res.json(db.categories);
  });

  app.post('/api/admin/categories', requireAdmin, (req, res) => {
    const db = DB.get();
    const { name, slug, description, image, parentId, sortOrder, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const cleanSlug = (slug || name).toLowerCase().trim().replace(/[\s_]+/g, '-');
    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name,
      slug: cleanSlug,
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      status: status || 'active',
      createdAt: new Date().toISOString(),
    };

    // Replace if same slug exists or push
    const existingIndex = db.categories.findIndex(c => c.slug === cleanSlug);
    if (existingIndex !== -1) {
      db.categories[existingIndex] = { ...db.categories[existingIndex], ...newCategory, id: db.categories[existingIndex].id };
    } else {
      db.categories.push(newCategory);
    }

    db.categories.sort((a, b) => a.sortOrder - b.sortOrder);
    DB.save();

    Promise.resolve(supabase.from('categories').upsert({
      id: newCategory.id,
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description,
      sort_order: newCategory.sortOrder,
      status: newCategory.status,
      created_at: newCategory.createdAt
    })).catch(() => {});

    res.status(201).json(newCategory);
  });

  app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
    const db = DB.get();
    let index = db.categories.findIndex(c => String(c.id) === String(req.params.id) || c.slug === req.params.id);
    if (index === -1) {
      const newCategory: Category = {
        id: req.params.id || 'cat-' + Date.now(),
        name: req.body.name || 'New Category',
        slug: (req.body.slug || 'cat-' + Date.now()).toLowerCase().trim().replace(/[\s_]+/g, '-'),
        description: req.body.description || '',
        image: req.body.image || '',
        parentId: req.body.parentId || null,
        sortOrder: Number(req.body.sortOrder) || 0,
        status: req.body.status || 'active',
        createdAt: new Date().toISOString(),
      };
      db.categories.push(newCategory);
      db.categories.sort((a, b) => a.sortOrder - b.sortOrder);
      DB.save();
      return res.json(newCategory);
    }

    db.categories[index] = {
      ...db.categories[index],
      ...req.body,
    };
    db.categories.sort((a, b) => a.sortOrder - b.sortOrder);
    DB.save();

    Promise.resolve(supabase.from('categories').upsert({
      id: db.categories[index].id,
      name: db.categories[index].name,
      slug: db.categories[index].slug,
      description: db.categories[index].description,
      sort_order: db.categories[index].sortOrder,
      status: db.categories[index].status
    })).catch(() => {});

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
    const db = DB.get();
    let list: Product[] = [...db.products.filter(p => p.status !== 'inactive')];

    if (list.length === 0) {
      try {
        const { data, error } = await supabase.from('products').select('*').neq('status', 'inactive');
        if (!error && data && data.length > 0) {
          list = data.map(mapSupabaseProduct);
        }
      } catch (e) {
        console.warn('Supabase products fetch warning:', e);
      }
    }

    const { category, search, size, minPrice, maxPrice, sort } = req.query;

    // Filter by Category
    if (category) {
      if (category === 'sale') {
        list = list.filter(p => p.salePrice !== null && p.salePrice !== undefined);
      } else if (category === 'new-arrivals') {
        list = list.filter(p => p.isNewArrival);
      } else {
        const catObj = db.categories.find(c => c.slug.toLowerCase() === (category as string).toLowerCase() || c.id === category);
        const targetId = catObj ? catObj.id : category;
        const targetSlug = catObj ? catObj.slug : category;
        list = list.filter(p => p.categoryId === targetId || p.categoryId === targetSlug);
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
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(list);
  });

  // Admin Products List
  app.get('/api/admin/products', requireAdmin, async (req, res) => {
    const db = DB.get();
    if (db.products && db.products.length > 0) {
      return res.json(db.products);
    }
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const products = data.map(mapSupabaseProduct);
        return res.json(products);
      }
    } catch (e) {
      console.warn('Supabase admin products fetch warning:', e);
    }
    res.json([]);
  });

  // Single product detail (by slug or ID)
  app.get('/api/products/:slug', async (req, res) => {
    const db = DB.get();
    const target = req.params.slug;
    let product = db.products.find(p => p.slug === target || String(p.id) === String(target));
    
    if (!product) {
      try {
        const { data, error } = await supabase.from('products').select('*').or(`slug.eq.${target},id.eq.${target}`).limit(1).maybeSingle();
        if (!error && data) {
          product = mapSupabaseProduct(data);
        }
      } catch (e) {
        console.warn('Supabase single product fetch warning:', e);
      }
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

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
  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const db = DB.get();
      let { name, slug, categoryId, sku, description, price, salePrice, sizes, colors, stockQuantity, mainImage, galleryImages, fabricDetails, careInstructions, featured, isNewArrival } = req.body;

      if (!name || price === undefined || price === null) {
        return res.status(400).json({ error: 'Product name and price are required' });
      }

      if (!slug) {
        slug = name.toLowerCase().trim().replace(/[\s_]+/g, '-');
      }

      let uniqueSlug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');
      let counter = 1;
      while (db.products.some(p => p.slug === uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        categoryId: categoryId || (db.categories[0]?.id || 'cat-unisex'),
        name,
        slug: uniqueSlug,
        sku: sku || 'CMF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        description: description || '',
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
        colors: Array.isArray(colors) && colors.length > 0 ? colors : [{ name: 'Black', hex: '#111111' }],
        stockQuantity: Number(stockQuantity) || 0,
        mainImage: mainImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        galleryImages: Array.isArray(galleryImages) && galleryImages.length > 0 ? galleryImages : [mainImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
        fabricDetails: fabricDetails || '',
        careInstructions: careInstructions || '',
        featured: !!featured,
        isNewArrival: !!isNewArrival,
        views: 0,
        status: Number(stockQuantity) > 0 ? 'active' : 'out_of_stock',
        createdAt: new Date().toISOString(),
      };

      db.products.unshift(newProduct);
      DB.save();

      syncProductToSupabase(newProduct).catch(err => console.warn('Sync error:', err));

      return res.status(201).json(newProduct);
    } catch (err: any) {
      console.error('Error adding product:', err);
      return res.status(500).json({ error: err?.message || 'Failed to add product' });
    }
  });

  // Admin Edit Product
  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const db = DB.get();
      const targetId = req.params.id;
      let index = db.products.findIndex(p => String(p.id) === String(targetId) || p.slug === targetId || (req.body.slug && p.slug === req.body.slug));

      if (index === -1) {
        // Upsert if not found
        const newProduct: Product = {
          id: targetId || 'prod-' + Date.now(),
          categoryId: req.body.categoryId || (db.categories[0]?.id || 'cat-unisex'),
          name: req.body.name || 'New Product',
          slug: req.body.slug || ('product-' + Date.now()),
          sku: req.body.sku || ('CMF-' + Date.now()),
          description: req.body.description || '',
          price: Number(req.body.price) || 0,
          salePrice: req.body.salePrice ? Number(req.body.salePrice) : null,
          sizes: req.body.sizes || ['S', 'M', 'L'],
          colors: req.body.colors || [{ name: 'Black', hex: '#111111' }],
          stockQuantity: Number(req.body.stockQuantity) || 0,
          mainImage: req.body.mainImage || '',
          galleryImages: req.body.galleryImages || [req.body.mainImage],
          fabricDetails: req.body.fabricDetails || '',
          careInstructions: req.body.careInstructions || '',
          featured: !!req.body.featured,
          isNewArrival: !!req.body.isNewArrival,
          views: 0,
          status: req.body.status || 'active',
          createdAt: new Date().toISOString()
        };
        db.products.unshift(newProduct);
        DB.save();
        syncProductToSupabase(newProduct).catch(err => console.warn('Sync error:', err));
        return res.json(newProduct);
      }

      const existing = db.products[index];
      const updated: Product = {
        ...existing,
        ...req.body,
        price: Number(req.body.price !== undefined ? req.body.price : existing.price),
        salePrice: req.body.salePrice !== undefined ? (req.body.salePrice ? Number(req.body.salePrice) : null) : existing.salePrice,
        stockQuantity: Number(req.body.stockQuantity !== undefined ? req.body.stockQuantity : existing.stockQuantity),
        mainImage: req.body.mainImage || existing.mainImage,
        galleryImages: Array.isArray(req.body.galleryImages) && req.body.galleryImages.length > 0 ? req.body.galleryImages : (req.body.mainImage ? [req.body.mainImage] : existing.galleryImages),
      };

      if (updated.stockQuantity > 0 && updated.status === 'out_of_stock') {
        updated.status = 'active';
      } else if (updated.stockQuantity <= 0) {
        updated.status = 'out_of_stock';
      }

      db.products[index] = updated;
      DB.save();

      syncProductToSupabase(updated).catch(err => console.warn('Sync error:', err));

      return res.json(updated);
    } catch (err: any) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: err?.message || 'Failed to update product' });
    }
  });

  // Admin Delete Product
  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const db = DB.get();
      const targetId = req.params.id;
      const index = db.products.findIndex(p => String(p.id) === String(targetId) || p.slug === targetId);
      if (index !== -1) {
        db.products.splice(index, 1);
        DB.save();
      }

      deleteProductFromSupabase(targetId).catch(err => console.warn('Delete error:', err));

      return res.json({ message: 'Product deleted permanently' });
    } catch (err: any) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: err?.message || 'Failed to delete product' });
    }
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
