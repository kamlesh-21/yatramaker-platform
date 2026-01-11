// server/scripts/migrateDestinationsForMultiCity.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Destination = require('../models/Destination');

dotenv.config(); // Load environment variables


async function migrateDestinations() {
  try {
    // Connect to YOUR database (check your .env for MONGODB_URI)
    await mongoose.connect(process.env.MONGODB_URI);
    
    
    const result = await mongoose.connection.db.collection('cities').updateMany(
      { experienceProfile: { $exists: false } },
      {
        $set: {
          experienceProfile: {
            historical: 5, spiritual: 5, adventure: 5, nature: 5, cultural: 5,
            photography: 5, shopping: 5, food: 5, relaxation: 5, nightlife: 5
          },
          visitMetrics: {
            recommendedDays: 2, minimumDays: 1, popularityScore: 5,
            uniquenessScore: 5, culturalImportance: 5, isTransitHub: false
          },
          infrastructure: {
            accommodationAvailable: true, hotelQualityAvg: 5,
            accessibilityScore: 5, familyFriendly: 5
          }
        }
      }
    );
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateDestinations();