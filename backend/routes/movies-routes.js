// backend/routes/movies-routes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// ایمن require کردن Model‌ها
let Movie;
try {
  Movie = require('../models/Movie');
  console.log('✅ Movie model loaded successfully');
} catch (error) {
  console.log('⚠️ Movie model not available:', error.message);
  Movie = null;
}

// ======================
// 🧪 Routes تست
// ======================

// 🧪 تست عمومی (بدون احراز)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Movies Routes کار می‌کنند! 🎬',
    hasMovieModel: !!Movie,
    hasUploadMiddleware: !!upload,
    hasAuthMiddleware: !!protect,
    timestamp: new Date().toISOString()
  });
});

// 🖼️ تست آپلود به Cloudinary (بدون احراز)
router.post('/upload-test', upload.single('image'), (req, res) => {
  try {
    console.log('🔗 Cloudinary upload test:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'هیچ فایلی آپلود نشد',
        hint: 'فیلد باید نامش "image" باشد و Type: File'
      });
    }
    
    res.json({
      success: true,
      message: 'آپلود به Cloudinary موفقیت‌آمیز بود! ☁️',
      file: {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        path: req.file.path,        // URL کامل Cloudinary
        filename: req.file.filename,
        size: req.file.size,
        cloudinaryUrl: req.file.path
      }
    });
    
  } catch (error) {
    console.error('❌ Upload test error:', error);
    
    // خطاهای خاص Multer
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'فقط یک فایل با نام "image" مجاز است',
        error: 'فیلدهای اضافی ارسال شده‌اند'
      });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم فایل نباید بیشتر از ۱۰ مگابایت باشد'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در آپلود فایل',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ======================
// 🎬 Routes اصلی فیلم‌ها
// ======================

// 📋 ۱. گرفتن همه فیلم‌ها (عمومی - بدون احراز)
router.get('/', async (req, res) => {
  try {
    console.log('📚 GET /movies - Fetching all movies...');
    
    if (Movie) {
      // گرفتن از MongoDB با اطلاعات کاربر سازنده
      const movies = await Movie.find()
        .populate('creator', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(50);
      
      console.log(`✅ Found ${movies.length} movies in database`);
      
      res.json({
        success: true,
        message: 'لیست فیلم‌ها',
        count: movies.length,
        data: movies.map(movie => ({
          id: movie._id,
          title: movie.title,
          description: movie.description,
          year: movie.year,
          director: movie.director,
          image: movie.image,
          rating: movie.rating || 0,
          likes: movie.likes || [],
          comments: movie.comments || [],
          creator: movie.creator ? {
            id: movie.creator._id,
            name: movie.creator.name,
            email: movie.creator.email,
            avatar: movie.creator.avatar
          } : null,
          createdAt: movie.createdAt,
          updatedAt: movie.updatedAt
        }))
      });
      
    } else {
      // نسخه دمو
      console.log('⚠️ Movie model not available, returning demo data');
      
      res.json({
        success: true,
        message: 'لیست فیلم‌ها (نسخه دمو)',
        count: 3,
        data: [
          {
            id: '1',
            title: 'اینتراستلار',
            description: 'یک فیلم علمی‌تخیلی درباره سفر در فضا و زمان',
            year: 2014,
            director: 'کریستوفر نولان',
            image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            rating: 8.6,
            likes: [],
            comments: [],
            creator: {
              id: 'user1',
              name: 'کاربر تست',
              email: 'test@example.com',
              avatar: 'https://res.cloudinary.com/demo/image/upload/avatar1.jpg'
            },
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            title: 'شوالیه تاریکی',
            description: 'داستان بتمن در برابر جوکر',
            year: 2008,
            director: 'کریستوفر نولان',
            image: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
            rating: 9.0,
            likes: [],
            comments: [],
            creator: {
              id: 'user2',
              name: 'کاربر تست ۲',
              email: 'test2@example.com',
              avatar: 'https://res.cloudinary.com/demo/image/upload/avatar2.jpg'
            },
            createdAt: '2024-01-14T15:45:00Z',
            updatedAt: '2024-01-14T15:45:00Z'
          },
          {
            id: '3',
            title: 'پروژه قدرت',
            description: 'فیلمی درباره سیاست و قدرت',
            year: 2022,
            director: 'آدام مک کی',
            image: 'https://res.cloudinary.com/demo/image/upload/sample3.jpg',
            rating: 7.8,
            likes: [],
            comments: [],
            creator: {
              id: 'user3', 
              name: 'کاربر تست ۳',
              email: 'test3@example.com',
              avatar: 'https://res.cloudinary.com/demo/image/upload/avatar3.jpg'
            },
            createdAt: '2024-01-13T09:20:00Z',
            updatedAt: '2024-01-13T09:20:00Z'
          }
        ],
        note: 'داده‌های دمو. برای داده‌های واقعی، Model Movie باید load شده باشد.'
      });
    }
    
  } catch (error) {
    console.error('❌ Error in GET /movies:', error);
    
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت فیلم‌ها',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ➕ ۲. ایجاد فیلم جدید (نیاز به احراز هویت)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('🎬 POST /movies - Creating new movie for user:', req.user._id);
    console.log('📝 Body:', req.body);
    console.log('📄 File:', req.file);
    
    // اعتبارسنجی فیلدهای اجباری
    const requiredFields = ['title', 'description', 'year', 'director'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `فیلدهای اجباری پر نشده‌اند: ${missingFields.join(', ')}`
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لطفاً یک عکس برای فیلم انتخاب کنید'
      });
    }
    
    // آماده کردن داده‌ها
    const movieData = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      year: parseInt(req.body.year),
      director: req.body.director.trim(),
      image: req.file.path, // URL Cloudinary
      creator: req.user._id, // کاربر جاری به عنوان سازنده
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // اضافه کردن rating اگر ارسال شده
    if (req.body.rating) {
      const rating = parseFloat(req.body.rating);
      if (rating >= 0 && rating <= 10) {
        movieData.rating = rating;
      }
    }
    
    console.log('💾 Movie data prepared:', movieData);
    
    if (Movie) {
      // ذخیره در MongoDB
      const movie = new Movie(movieData);
      const savedMovie = await movie.save();
      
      console.log('✅ Movie saved to MongoDB with ID:', savedMovie._id);
      
      // Populate اطلاعات کاربر
      await savedMovie.populate('creator', 'name email avatar');
      
      // پاسخ موفقیت‌آمیز
      res.status(201).json({
        success: true,
        message: 'فیلم با موفقیت ایجاد و در دیتابیس ذخیره شد! 🎉',
        data: {
          id: savedMovie._id,
          title: savedMovie.title,
          description: savedMovie.description,
          year: savedMovie.year,
          director: savedMovie.director,
          image: savedMovie.image,
          rating: savedMovie.rating || 0,
          likes: savedMovie.likes || [],
          comments: savedMovie.comments || [],
          creator: {
            id: savedMovie.creator._id,
            name: savedMovie.creator.name,
            email: savedMovie.creator.email,
            avatar: savedMovie.creator.avatar
          },
          createdAt: savedMovie.createdAt,
          updatedAt: savedMovie.updatedAt
        }
      });
      
    } else {
      // نسخه دمو
      console.log('⚠️ Movie model not available, returning demo response');
      
      res.status(201).json({
        success: true,
        message: 'فیلم ایجاد شد (نسخه دمو)',
        data: {
          ...movieData,
          id: 'demo-' + Date.now(),
          rating: movieData.rating || 0,
          likes: [],
          comments: [],
          creator: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
          }
        },
        note: 'داده‌ها در دیتابیس ذخیره نشدند. برای ذخیره واقعی، Model Movie باید load شده باشد.'
      });
    }
    
  } catch (error) {
    console.error('❌ Error in POST /movies:', error);
    
    // خطاهای خاص
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'داده‌های نامعتبر',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'این فیلم قبلاً ثبت شده است'
      });
    }
    
    // خطاهای Multer
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم فایل نباید بیشتر از ۱۰ مگابایت باشد'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد فیلم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 👤 ۳. گرفتن فیلم‌های کاربر جاری (نیاز به احراز هویت)
router.get('/my-movies', protect, async (req, res) => {
  try {
    console.log('👤 GET /movies/my-movies - User:', req.user._id);
    
    if (!Movie) {
      return res.status(500).json({
        success: false,
        message: 'سیستم در دسترس نیست'
      });
    }
    
    // فقط فیلم‌های کاربر جاری
    const movies = await Movie.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .populate('creator', 'name email avatar');
    
    console.log(`✅ Found ${movies.length} movies for user ${req.user._id}`);
    
    res.json({
      success: true,
      message: 'فیلم‌های شما',
      count: movies.length,
      data: movies.map(movie => ({
        id: movie._id,
        title: movie.title,
        description: movie.description,
        year: movie.year,
        director: movie.director,
        image: movie.image,
        rating: movie.rating || 0,
        likes: movie.likes || [],
        comments: movie.comments || [],
        creator: movie.creator ? {
          id: movie.creator._id,
          name: movie.creator.name,
          email: movie.creator.email,
          avatar: movie.creator.avatar
        } : null,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt
      }))
    });
    
  } catch (error) {
    console.error('❌ Error in GET /movies/my-movies:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت فیلم‌های شما'
    });
  }
});

// 🎯 ۴. گرفتن یک فیلم خاص (عمومی)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🎯 GET /movies/${id} called`);
    
    if (Movie) {
      const movie = await Movie.findById(id)
        .populate('creator', 'name email avatar')
        .populate('comments')
        .populate('likes', 'name');
      
      if (!movie) {
        return res.status(404).json({
          success: false,
          message: 'فیلم پیدا نشد'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: movie._id,
          title: movie.title,
          description: movie.description,
          year: movie.year,
          director: movie.director,
          image: movie.image,
          rating: movie.rating || 0,
          likes: movie.likes || [],
          comments: movie.comments || [],
          creator: movie.creator ? {
            id: movie.creator._id,
            name: movie.creator.name,
            email: movie.creator.email,
            avatar: movie.creator.avatar
          } : null,
          createdAt: movie.createdAt,
          updatedAt: movie.updatedAt
        }
      });
      
    } else {
      // نسخه دمو
      res.json({
        success: true,
        message: 'جزئیات فیلم (نسخه دمو)',
        data: {
          id: id,
          title: 'فیلم تست',
          description: 'این یک فیلم تست است',
          year: 2024,
          director: 'کارگردان تست',
          image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          rating: 7.5,
          likes: [],
          comments: [],
          creator: {
            id: 'user1',
            name: 'کاربر تست',
            email: 'test@example.com',
            avatar: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error(`❌ Error in GET /movies/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'شناسه فیلم نامعتبر است'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت فیلم'
    });
  }
});

module.exports = router;