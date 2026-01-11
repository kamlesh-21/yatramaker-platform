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

    // --- Destinations ---
    await mongoose.connection.db.collection('destinations').createIndex(
      { type: 1, averageBudget: 1 }
    );
    await mongoose.connection.db.collection('destinations').createIndex(
      { destination_id: 1 },
      { unique: true }
    );

    // --- Clusters ---
    await mongoose.connection.db.collection('clusters').createIndex(
      { type: 1, minDays: 1 }
    );

    // --- Hotel Collections ---
    await mongoose.connection.db.collection('hotelcollections').createIndex(
      { destination_id: 1 }
    );
    await mongoose.connection.db.collection('hotelcollections').createIndex(
      { 'hotels.category': 1 }
    );

    // --- Activity Collections ---
    await mongoose.connection.db.collection('activitycollections').createIndex(
      { destination_id: 1 }
    );

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating indexes:', err);
    process.exit(1);
  }
}

createIndexes();
