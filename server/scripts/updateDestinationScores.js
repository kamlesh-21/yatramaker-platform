// server/scripts/updateDestinationScores.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log("Connecting to:", process.env.MONGODB_URI);

const updates = [
  {
    name: "Rajgir",
    experienceProfile: {
      historical: 8, spiritual: 7, adventure: 6, nature: 6, cultural: 7,
      photography: 7, shopping: 3, food: 5, relaxation: 6, nightlife: 2
    },
    visitMetrics: {
      recommendedDays: 2, minimumDays: 1, popularityScore: 4,
      uniquenessScore: 5, culturalImportance: 7, isTransitHub: false
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 5,
      accessibilityScore: 5, familyFriendly: 7
    }
  },
  {
    name: "Nalanda",
    experienceProfile: {
      historical: 9, spiritual: 6, adventure: 2, nature: 4, cultural: 8,
      photography: 6, shopping: 2, food: 4, relaxation: 5, nightlife: 1
    },
    visitMetrics: {
      recommendedDays: 2, minimumDays: 1, popularityScore: 5,
      uniquenessScore: 7, culturalImportance: 8, isTransitHub: false
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 4,
      accessibilityScore: 5, familyFriendly: 6
    }
  },
  {
    name: "Varanasi",
    experienceProfile: {
      historical: 10, spiritual: 10, adventure: 3, nature: 3, cultural: 10,
      photography: 9, shopping: 7, food: 8, relaxation: 5, nightlife: 4
    },
    visitMetrics: {
      recommendedDays: 3, minimumDays: 2, popularityScore: 9,
      uniquenessScore: 9, culturalImportance: 10, isTransitHub: true
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 6,
      accessibilityScore: 7, familyFriendly: 7
    }
  },
  {
    name: "Agra",
    experienceProfile: {
      historical: 10, spiritual: 4, adventure: 2, nature: 3, cultural: 9,
      photography: 9, shopping: 6, food: 7, relaxation: 4, nightlife: 3
    },
    visitMetrics: {
      recommendedDays: 2, minimumDays: 1, popularityScore: 10,
      uniquenessScore: 9, culturalImportance: 9, isTransitHub: true
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 6,
      accessibilityScore: 8, familyFriendly: 7
    }
  },
  {
    name: "Goa",
    experienceProfile: {
      historical: 4, spiritual: 5, adventure: 6, nature: 9, cultural: 7,
      photography: 8, shopping: 6, food: 9, relaxation: 9, nightlife: 9
    },
    visitMetrics: {
      recommendedDays: 3, minimumDays: 2, popularityScore: 9,
      uniquenessScore: 7, culturalImportance: 7, isTransitHub: true
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 7,
      accessibilityScore: 8, familyFriendly: 7
    }
  },
  {
    name: "Gaya",
    experienceProfile: {
      historical: 8, spiritual: 10, adventure: 2, nature: 4, cultural: 9,
      photography: 7, shopping: 4, food: 5, relaxation: 5, nightlife: 1
    },
    visitMetrics: {
      recommendedDays: 2, minimumDays: 1, popularityScore: 7,
      uniquenessScore: 8, culturalImportance: 10, isTransitHub: true
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 5,
      accessibilityScore: 6, familyFriendly: 7
    }
  },
  {
    name: "Manali",
    experienceProfile: {
      historical: 3, spiritual: 4, adventure: 9, nature: 8, cultural: 6,
      photography: 9, shopping: 5, food: 6, relaxation: 7, nightlife: 5
    },
    visitMetrics: {
      recommendedDays: 3, minimumDays: 2, popularityScore: 7,
      uniquenessScore: 6, culturalImportance: 5, isTransitHub: false
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 6,
      accessibilityScore: 6, familyFriendly: 8
    }
  },
  {
    name: "Udaipur",
    experienceProfile: {
      historical: 9, spiritual: 6, adventure: 4, nature: 7, cultural: 9,
      photography: 9, shopping: 7, food: 8, relaxation: 8, nightlife: 4
    },
    visitMetrics: {
      recommendedDays: 3, minimumDays: 2, popularityScore: 8,
      uniquenessScore: 7, culturalImportance: 9, isTransitHub: true
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 7,
      accessibilityScore: 7, familyFriendly: 8
    }
  },
  {
    name: "Jaipur",
    experienceProfile: {
      historical: 9, spiritual: 6, adventure: 5, nature: 4, cultural: 10,
      photography: 9, shopping: 8, food: 8, relaxation: 6, nightlife: 5
    },
    visitMetrics: {
      recommendedDays: 3, minimumDays: 2, popularityScore: 9,
      uniquenessScore: 7, culturalImportance: 10, isTransitHub: true
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 7,
      accessibilityScore: 8, familyFriendly: 8
    }
  },
  {
    name: "Rishikesh",
    experienceProfile: {
      historical: 6, spiritual: 9, adventure: 8, nature: 8, cultural: 8,
      photography: 8, shopping: 5, food: 6, relaxation: 7, nightlife: 3
    },
    visitMetrics: {
      recommendedDays: 2, minimumDays: 1, popularityScore: 8,
      uniquenessScore: 6, culturalImportance: 9, isTransitHub: true
    },
    infrastructure: {
      accommodationAvailable: true, hotelQualityAvg: 6,
      accessibilityScore: 7, familyFriendly: 7
    }
  }
];

async function runUpdates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to:', mongoose.connection.db.databaseName);

    const cities = mongoose.connection.db.collection('cities');
    for (const u of updates) {
      const res = await cities.updateOne({ name: u.name }, { $set: u }, { upsert: false });
      console.log(`✅ Updated: ${u.name} (${res.modifiedCount} modified)`);
    }

    console.log('🎯 All destination scores updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating destinations:', err);
    process.exit(1);
  }
}

runUpdates();
