// routes/auth-routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // ← اینجا import کن!


// ======================
// 🧪 تست Route
// ======================
router.get('/test', (req, res) => {
  res.json({ message: 'Auth Routes کار می‌کند!' });
});

// ======================
// 🧑‍🤝‍🧑 ۱. ثبت‌نام کاربر جدید
// ======================
router.post('/register', async (req, res) => {
  try {
    console.log('درخواست ثبت‌نام:', req.body);

    // ۱. گرفتن داده‌ها از درخواست
    const { name, email, password } = req.body;

    // ۲. اعتبارسنجی اولیه
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'لطفاً همه فیلدها را پر کنید' 
      });
    }

    // ۳. بررسی اینکه کاربر از قبل وجود دارد
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'این ایمیل قبلاً ثبت شده است' 
      });
    }

    // ۴. هش کردن پسورد
    const salt = await bcrypt.genSalt(10); // تولید نمک
    const hashedPassword = await bcrypt.hash(password, salt);

    // ۵. ایجاد کاربر جدید
    const user = new User({
      name,
      email: email.toLowerCase(), // ذخیره به صورت کوچک
      password: hashedPassword
    });

    // ۶. ذخیره در دیتابیس
    await user.save();
    console.log('کاربر جدید ذخیره شد:', user._id);

    // ۷. ساخت توکن JWT
    const token = jwt.sign(
      { 
        id: user._id, // 🔑 اینجا ID را در توکن قرار می‌دهیم!
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // ۷ روز اعتبار
    );

    // ۸. برگرداندن پاسخ موفق
    res.status(201).json({
      success: true,
      message: 'ثبت‌نام موفقیت‌آمیز بود',
      token, // 🚀 اینجا توکن به فرانت‌اند می‌رود
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ خطا در ثبت‌نام:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطای سرور در ثبت‌نام' 
    });
  }
});

// ======================
// 🔐 ۲. ورود کاربر
// ======================
router.post('/login', async (req, res) => {
  try {
    console.log('درخواست ورود:', req.body);

    // ۱. گرفتن داده‌ها
    const { email, password } = req.body;

    // ۲. اعتبارسنجی اولیه
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'لطفاً ایمیل و رمز عبور را وارد کنید' 
      });
    }

    // ۳. پیدا کردن کاربر با ایمیل
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'ایمیل یا رمز عبور نادرست است' 
      });
    }

    // ۴. مقایسه پسورد
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: 'ایمیل یا رمز عبور نادرست است' 
      });
    }

    // ۵. ساخت توکن JWT
    const token = jwt.sign(
      { 
        id: user._id, // 🔑 اینجا ID را در توکن قرار می‌دهیم!
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ۶. برگرداندن پاسخ موفق
    res.json({
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      token, // 🚀 اینجا توکن به فرانت‌اند می‌رود
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ خطا در ورود:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطای سرور در ورود' 
    });
  }
});

// ======================
// 👤 ۳. گرفتن اطلاعات کاربر جاری (نیاز به توکن)
// ======================
router.get('/me', protect, async (req, res) => { // ← protect اضافه شد!
  try {
    // ❌ دیگر نیازی به چک کردن دستی توکن نیست!
    // ✅ req.user از middleware آمده
    
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'خطای سرور' 
    });
  }
});

module.exports = router;