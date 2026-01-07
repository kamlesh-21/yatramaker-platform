// // server/config/database.js
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   if (!process.env.MONGODB_URI) {
//     console.warn('MONGODB_URI not set, defaulting to mongodb://127.0.0.1:27017/yatramaker');
//   }
//   const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yatramaker';
//   const options = {
//     maxPoolSize: 10,
//     serverSelectionTimeoutMS: 5000,
//     socketTimeoutMS: 45000,
//     bufferCommands: false,
//     bufferMaxEntries: 0,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   };
//   await mongoose.connect(uri, options);
//   console.log('MongoDB connected');
// };

// module.exports = connectDB;
