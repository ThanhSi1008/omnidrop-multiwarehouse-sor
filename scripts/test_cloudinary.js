require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const https = require('https');

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download image: HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', reject);
  });
}

async function testCloudinary() {
  console.log('================================================================');
  console.log('☁️ TESTING CLOUDINARY API CONNECTION & REAL IMAGE UPLOAD');
  console.log('================================================================');
  console.log(`Cloud Name : ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`API Key    : ${process.env.CLOUDINARY_API_KEY}`);
  console.log('================================================================\n');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    // 1. Ping Cloudinary API
    console.log('[1/3] Pinging Cloudinary API...');
    const pingResult = await cloudinary.api.ping();
    console.log('  ✅ Cloudinary API Ping Result:', pingResult);

    // 2. Download sample PNG image
    console.log('\n[2/3] Downloading real sample PNG image...');
    const scratchDir = path.join(__dirname, '..', 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    
    const sampleFilePath = path.join(scratchDir, 'sample_fashion.png');
    await downloadImage('https://dummyimage.com/400x400/06b6d4/ffffff.png&text=Omnidrop+Fashion', sampleFilePath);
    console.log(`  ✅ Real image downloaded to: ${sampleFilePath}`);

    // 3. Upload file
    console.log('\n[3/3] Uploading image to Cloudinary CDN...');
    const uploadResult = await cloudinary.uploader.upload(sampleFilePath, {
      folder: 'omnidrop_apparel_test',
      public_id: `omni_fashion_${Date.now()}`,
    });

    console.log('\n  ✅ IMAGE UPLOADED SUCCESSFULLY TO CLOUDINARY!');
    console.log(`  🔗 Cloudinary Public ID : ${uploadResult.public_id}`);
    console.log(`  🔗 Cloudinary CDN URL   : ${uploadResult.secure_url}`);
    console.log(`  📏 Image Format & Size  : ${uploadResult.format?.toUpperCase()} (${uploadResult.width}x${uploadResult.height}px)`);

    console.log('\n================================================================');
    console.log('🎉 ALL CLOUDINARY TESTS PASSED 100%!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ CLOUDINARY ERROR:', err);
  }
}

testCloudinary();
