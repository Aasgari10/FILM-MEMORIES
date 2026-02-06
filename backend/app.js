const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth-routes');
const movieRoutes = require('./routes/movies-routes');


const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ======================
// 📍 Routes
// ======================
app.use('/api/auth', authRoutes); // این خط رو اضافه کن!
app.use('/api/movies', movieRoutes);


// 🏠 Home route
app.get('/', (req, res) => {
  res.json({
    message: '🎬 FilmMemories API',
    version: '1.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      home: '/',
      health: '/api/health',
      test: '/api/test',
      users: '/api/users (coming soon)',
      movies: '/api/movies (coming soon)'
    }
  });
});

// 🩺 Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      state: statusMap[dbStatus] || 'unknown',
      code: dbStatus
    },
    memory: process.memoryUsage()
  });
});

// 🧪 Test route
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working correctly!',
    timestamp: new Date().toISOString()
  });
});

// ======================
// 🚀 Database Connection & Server Start
// ======================

const startServer = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📝 Connection string (first 50 chars):', MONGODB_URI.substring(0, 50) + '...');
    
    // روش ۱: ساده‌ترین
    await mongoose.connect(MONGODB_URI);
    
    // یا روش ۲: با object خالی اگر خطا داد
    // await mongoose.connect(MONGODB_URI, {});
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`👤 Host: ${mongoose.connection.host}`);
    console.log(`🔗 Ready State: ${mongoose.connection.readyState}`);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📌 Available endpoints:');
      console.log(`   Home: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Test: http://localhost:${PORT}/api/test`);
      console.log('\n🛠️  Press Ctrl+C to stop');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check MONGODB_URI in .env file');
    console.error('   2. Make sure your IP is whitelisted in MongoDB Atlas');
    console.error('   3. Check internet connection');
    console.error('   4. Try this temporary connection string for test:');
    console.error('      mongodb+srv://alimanuss2002_db_user:9211230011@cluster0.afcsqvr.mongodb.net/test?retryWrites=true&w=majority');
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Start the application
startServer();