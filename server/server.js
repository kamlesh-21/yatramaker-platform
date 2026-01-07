// // server/server.js
// const { generateSitemap } = require('./scripts/generateSitemap');
// const fs = require('fs');
// const path = require('path');
// const express = require('express');
// const mongoose = require('mongoose');
// const morgan = require('morgan'); // Import morgan
// const cors = require('cors')
// const bookingRoutes = require('./routes/bookings');
// const quoteRoutes = require('./routes/quotes');

// require('dotenv').config();

// const app = express();
// app.use(cors())

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     // Remove deprecated options
//   })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.log('MongoDB connection error:', err));

// // Morgon dev
// app.use(require('morgan')('dev'));

// //Middleware
// app.use(express.json());

// // Serve robots.txt and sitemap.xml
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/sitemap.xml', async (req, res) => {
//   const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
//   try {
//     // In development, serve existing sitemap without generating
//     if (process.env.NODE_ENV === 'development' && fs.existsSync(sitemapPath)) {
//       return res.sendFile(sitemapPath, { headers: { 'Content-Type': 'application/xml' } });
//     }
//     // Existing logic for production or if file is missing
//     const stats = fs.statSync(sitemapPath);
//     const mtime = new Date(stats.mtime);
//     const now = new Date();
//     const hoursSinceLastGeneration = (now - mtime) / (1000 * 60 * 60);
//     if (!fs.existsSync(sitemapPath) || hoursSinceLastGeneration > 24) {
//       await generateSitemap();
//     }
//     res.sendFile(sitemapPath, { headers: { 'Content-Type': 'application/xml' } });
//   } catch (error) {
//     console.error('Error serving sitemap:', error);
//     res.status(500).send('Error generating sitemap');
//   }
// });

// app.use('/api/blog', require('./routes/blog'));

// // Add auth Routes
// app.use('/api/auth', require('./routes/auth'));

// // Add subscription route
// app.use('/api/subscribe', require('./routes/subscribe')); 

// //added this new file. v2.0
// const travelDataRoutes = require('./routes/travelData');
// app.use('/api/travelData', travelDataRoutes);

// const hotelRoute = require('./routes/hotelData'); 
// app.use('/api/hotelData', hotelRoute);

// app.use('/api/bookings', bookingRoutes);
// app.use('/api/quotes', quoteRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import routes
const bookingRoutes = require('./routes/bookings');
const quoteRoutes = require('./routes/quotes');
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const subscribeRoutes = require('./routes/subscribe');
const travelDataRoutes = require('./routes/travelData');
const hotelRoute = require('./routes/hotelData');

// Check if generateSitemap exists before requiring
let generateSitemap;
try {
  generateSitemap = require('./scripts/generateSitemap').generateSitemap;
} catch (error) {
  console.warn('⚠️  Sitemap generator not found, skipping sitemap generation');
  generateSitemap = null;
}

const app = express();

// ✅ FIX: Configure CORS properly
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// ✅ FIX: Morgan middleware - use imported morgan, not require again
app.use(morgan('dev'));

// ✅ FIX: Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ FIX: Serve static files from correct directories
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ FIX: MongoDB connection with proper options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('⚠️  Running in mock mode - data will not persist');
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    node: process.version,
    environment: process.env.NODE_ENV || 'development'
  };
  res.json(health);
});

// ✅ Sitemap endpoint with better error handling
if (generateSitemap) {
  app.get('/sitemap.xml', async (req, res) => {
    const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    
    try {
      // Serve existing sitemap if available
      if (fs.existsSync(sitemapPath)) {
        const stats = fs.statSync(sitemapPath);
        const mtime = new Date(stats.mtime);
        const now = new Date();
        const hoursSinceLastGeneration = (now - mtime) / (1000 * 60 * 60);
        
        // Regenerate if older than 24 hours or in production
        if (process.env.NODE_ENV === 'production' && hoursSinceLastGeneration > 24) {
          console.log('🔄 Regenerating sitemap...');
          await generateSitemap();
        }
        
        return res.sendFile(sitemapPath, { 
          headers: { 'Content-Type': 'application/xml' } 
        });
      } else {
        // Generate sitemap if doesn't exist
        console.log('📝 Generating new sitemap...');
        await generateSitemap();
        return res.sendFile(sitemapPath, { 
          headers: { 'Content-Type': 'application/xml' } 
        });
      }
    } catch (error) {
      console.error('❌ Sitemap error:', error);
      res.status(500).send('Error generating sitemap');
    }
  });
} else {
  app.get('/sitemap.xml', (req, res) => {
    res.status(404).send('Sitemap generator not available');
  });
}

// ✅ API Routes with proper error handling
const apiRouter = express.Router();

// Mount all API routes
apiRouter.use('/blog', blogRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/subscribe', subscribeRoutes);
apiRouter.use('/travelData', travelDataRoutes);
apiRouter.use('/hotelData', hotelRoute);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/quotes', quoteRoutes);

// Apply API router with prefix
app.use('/api', apiRouter);

// ✅ Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Travel Booking API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      blog: '/api/blog',
      auth: '/api/auth',
      subscribe: '/api/subscribe',
      travelData: '/api/travelData',
      hotelData: '/api/hotelData',
      bookings: '/api/bookings',
      quotes: '/api/quotes'
    },
    docs: 'Coming soon...'
  });
});

// ✅ 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    availableEndpoints: [
      'POST /api/bookings/create',
      'POST /api/quotes/request',
      'GET /api/travelData/recommendations',
      'GET /api/auth/user',
      'GET /api/blog',
      'POST /api/subscribe'
    ]
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate field value entered'
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
    console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('📋 Available endpoints:');
    console.log('   GET  /health');
    console.log('   POST /api/bookings/create');
    console.log('   POST /api/quotes/request');
    console.log('   POST /api/travelData/recommendations');
    console.log('   GET  /api/auth/user');
    console.log('   GET  /sitemap.xml');
  });
}

module.exports = app; // For testing