require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const https = require('https');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Source high quality apparel images from Unsplash CDN
const APPAREL_PRODUCT_IMAGES = [
  {
    sku: 'KINH-X-DEN-SIZE-M',
    title: 'Áo Polo Nam Luxury Cool-Tech Omni',
    sourceUrl: 'https://images.unsplash.com/photo-1625910513413-5acc234db677?w=800&auto=format&fit=crop&q=80',
    publicId: 'polo_cooltech_luxury_black',
  },
  {
    sku: 'HOODIE-OMNI-BLACK-L',
    title: 'Áo Hoodie Oversized Omni Heavyweight',
    sourceUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    publicId: 'hoodie_oversized_heavyweight',
  },
  {
    sku: 'QUAN-KHAKI-OWEN-SLIM',
    title: 'Quần Khaki Slim-Fit Co Giãn Owen Premium',
    sourceUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    publicId: 'quan_khaki_owen_slimfit',
  },
  {
    sku: 'AO-SOMI-FORMAL-TRANG',
    title: 'Áo Sơ Mi Nam Formal Trắng Chống Nhăn',
    sourceUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    publicId: 'ao_somi_formal_trang_premium',
  },
  {
    sku: 'AO-KHOAC-BOMBER-DEN',
    title: 'Áo Khoác Bomber Minimalist Windbreaker',
    sourceUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    publicId: 'ao_khoac_bomber_minimalist',
  },
  {
    sku: 'COMBO-3-AO-THUN-BASIC',
    title: 'Combo 3 Áo Thun Basic Cotton 100%',
    sourceUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    publicId: 'combo_3_ao_thun_basic_cotton',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', reject);
  });
}

async function uploadCatalogToCloudinary() {
  console.log('================================================================');
  console.log('☁️ UPLOADING APPAREL CATALOG IMAGES TO CLOUDINARY CDN');
  console.log('================================================================');
  console.log(`Cloud Name : ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log('================================================================\n');

  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const cloudinaryUrls = {};

  for (const item of APPAREL_PRODUCT_IMAGES) {
    console.log(`[+] Processing SKU: ${item.sku} (${item.title})...`);
    const localFilePath = path.join(scratchDir, `${item.publicId}.jpg`);

    try {
      console.log(`  1. Downloading high-res image from source...`);
      await downloadFile(item.sourceUrl, localFilePath);

      console.log(`  2. Uploading & Optimizing on Cloudinary CDN...`);
      const uploadRes = await cloudinary.uploader.upload(localFilePath, {
        folder: 'omnidrop_apparel_products',
        public_id: item.publicId,
        overwrite: true,
        transformation: [
          { width: 1000, height: 1000, crop: 'fill', gravity: 'auto', quality: 'auto', format: 'webp' }
        ]
      });

      cloudinaryUrls[item.sku] = uploadRes.secure_url;
      console.log(`  ✅ SUCCESS! Cloudinary CDN WebP URL: ${uploadRes.secure_url}\n`);
    } catch (err) {
      console.error(`  ❌ Error processing ${item.sku}:`, err.message);
    }
  }

  console.log('================================================================');
  console.log('📝 CLOUDINARY APPAREL CDN MAP GENERATED:');
  console.log('================================================================');
  console.log(JSON.stringify(cloudinaryUrls, null, 2));

  // Save map to scratch JSON for reference
  const mapPath = path.join(scratchDir, 'cloudinary_catalog_map.json');
  fs.writeFileSync(mapPath, JSON.stringify(cloudinaryUrls, null, 2));
  console.log(`\nSaved CDN map to: ${mapPath}`);
}

uploadCatalogToCloudinary();
