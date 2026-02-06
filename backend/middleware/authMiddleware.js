// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// بررسی اینکه توکن معتبر است یا نه
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // گرفتن توکن از هدر
      token = req.headers.authorization.split(' ')[1];
      
      // بررسی اعتبار توکن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // پیدا کردن کاربر بدون پسورد
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'توکن نامعتبر است' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'توکن ارسال نشده' });
  }
};

// بررسی اینکه کاربر ادمین است یا نه
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'دسترسی غیرمجاز. فقط ادمین' });
  }
};

module.exports = { protect, admin };