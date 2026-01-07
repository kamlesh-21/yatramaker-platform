// server/database/indexes.js
// Run this once to create recommended indexes
// Usage: `node server/database/indexes.js`

// server/database/indexes.js
require('dotenv').config();
const mongoose = require('mongoose');

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // --- Destinations ---
    await mongoose.connection.db.collection('destinations').createIndex(
      { type: 1, averageBudget: 1 }
    );
    await mongoose.connection.db.collection('destinations').createIndex(
      { destination_id: 1 },
      { unique: true }
    );
    console.log('✅ Destination indexes created');

    // --- Clusters ---
    await mongoose.connection.db.collection('clusters').createIndex(
      { type: 1, minDays: 1 }
    );
    console.log('✅ Cluster indexes created');

    // --- Hotel Collections ---
    await mongoose.connection.db.collection('hotelcollections').createIndex(
      { destination_id: 1 }
    );
    await mongoose.connection.db.collection('hotelcollections').createIndex(
      { 'hotels.category': 1 }
    );
    console.log('✅ HotelCollection indexes created');

    // --- Activity Collections ---
    await mongoose.connection.db.collection('activitycollections').createIndex(
      { destination_id: 1 }
    );
    console.log('✅ ActivityCollection indexes created');

    console.log('🎉 All indexes created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating indexes:', err);
    process.exit(1);
  }
}

createIndexes();
