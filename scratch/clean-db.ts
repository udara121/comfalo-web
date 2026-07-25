import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

if (fs.existsSync(dbPath)) {
  const raw = fs.readFileSync(dbPath, 'utf-8');
  let db = JSON.parse(raw);

  const defaultImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';

  if (Array.isArray(db.products)) {
    db.products = db.products.map((p: any) => {
      if (p.mainImage && p.mainImage.startsWith('data:image')) {
        p.mainImage = defaultImage;
      }
      if (Array.isArray(p.galleryImages)) {
        p.galleryImages = p.galleryImages.map((img: string) => 
          img.startsWith('data:image') ? defaultImage : img
        );
      }
      return p;
    });
  }

  if (Array.isArray(db.banners)) {
    db.banners = db.banners.map((b: any) => {
      if (b.image && b.image.startsWith('data:image')) {
        b.image = defaultImage;
      }
      return b;
    });
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Successfully cleaned base64 images from db.json! New size:', fs.statSync(dbPath).size, 'bytes');
} else {
  console.log('db.json not found');
}
