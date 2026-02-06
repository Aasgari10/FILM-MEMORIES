// backend/config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log('☁️ Configuring Cloudinary...');

// مستقیماً credentials
cloudinary.config({
  cloud_name: 'dgd9keqsp',
  api_key: '378739413855689',
  api_secret: 'qfRYEUJB6W9i2j21ANobWa1pUpM'
});

console.log('✅ Cloudinary configured');

// این باید CloudinaryStorage باشه
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'film-memories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
  }
});

console.log('📦 Storage type:', storage.constructor.name);

module.exports = { cloudinary, storage };