import { supabase } from '../src/lib/supabase';
import { DB } from './db';

export async function migrateLocalDbToSupabase() {
  const db = DB.get();

  const results = {
    categories: 0,
    products: 0,
    banners: 0,
    settings: false,
    errors: [] as string[]
  };

  try {
    // 1. Migrate Categories
    if (db.categories && db.categories.length > 0) {
      for (const cat of db.categories) {
        const { error } = await supabase.from('categories').upsert({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          sort_order: cat.sortOrder || 0,
          status: cat.status || 'active',
          created_at: cat.createdAt || new Date().toISOString()
        });
        if (!error) {
          results.categories++;
        } else {
          if (!results.errors.includes(error.message)) {
            results.errors.push(`Categories table: ${error.message}`);
          }
        }
      }
    }

    // 2. Migrate Products
    if (db.products && db.products.length > 0) {
      for (const prod of db.products) {
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
        if (!error) {
          results.products++;
        } else {
          if (!results.errors.includes(error.message)) {
            results.errors.push(`Products table: ${error.message}`);
          }
        }
      }
    }

    // 3. Migrate Banners
    if (db.banners && db.banners.length > 0) {
      for (const ban of db.banners) {
        const { error } = await supabase.from('banners').upsert({
          id: ban.id,
          title: ban.title,
          subtitle: ban.subtitle,
          image: ban.image,
          link_url: ban.linkUrl,
          button_text: ban.buttonText,
          sort_order: ban.sortOrder,
          status: ban.status,
          created_at: ban.createdAt || new Date().toISOString()
        });
        if (!error) {
          results.banners++;
        } else {
          if (!results.errors.includes(error.message)) {
            results.errors.push(`Banners table: ${error.message}`);
          }
        }
      }
    }

    // 4. Migrate Settings
    if (db.settings) {
      const { error } = await supabase.from('settings').upsert({
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
      if (!error) {
        results.settings = true;
      } else {
        if (!results.errors.includes(error.message)) {
          results.errors.push(`Settings table: ${error.message}`);
        }
      }
    }

  } catch (err: any) {
    results.errors.push(err.message || String(err));
  }

  return results;
}
