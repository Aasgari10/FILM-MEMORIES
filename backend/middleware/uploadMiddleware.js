    // backend/middleware/uploadMiddleware.js
    const multer = require('multer');
    const { storage } = require('../config/cloudinaryConfig'); // این خط مهمه

    console.log('🔧 Upload middleware using storage:', storage.constructor.name);

    const upload = multer({
    storage: storage,  // باید CloudinaryStorage باشه
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
        } else {
        cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
    }
    });

    module.exports = upload;