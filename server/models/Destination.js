// server/models/Destination.js

const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  photographer_name: {
    type: String,
    required: true,
  },
  unsplash_link: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
}, { _id: false });

const DestinationSchema = new mongoose.Schema({
  destination_id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: [String],
    required: true,
  },
  type: {
    type: [String], 
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  travel: {
    airports: [
      {
        name: String,
        latitude: Number,
        longitude: Number,
        distance: Number,
      },
    ],
    railwayStations: [
      {
        name: String,
        latitude: Number,
        longitude: Number,
        distance: Number,
      },
    ],
    drivingDistances: {
      type: Map,
      of: Number,
    },
  },
  localExpenses: {
    transportation: Number,
    meals: {
      budget: Number,
      midrange: Number,
      luxury: Number,
    },
    attractions: [
      {
        name: String,
        cost: Number,
      },
    ],
  },
  seasonality: {
    peakSeason: String,
    offPeakSeason: String,
    weather: {
      type: Map,
      of: {
        averageTemp: Number,
        rainfall: String,
      },
    },
  },
  additionalLocalInfo: {
    touristPoints: [String],
    thingsToDo: [String],
    nightlifeHubs: [String],
    photographySpots: [String],
    localAuthenticShopping: [String],
    bestPlacesToEat: [String],
    mustTryDishes: [String],
    hiddenGems: [String],
    safetySecurityTips: [String],
    // Add other fields as needed
  },
  images: [ImageSchema], 
    experienceProfile: {
    historical: Number,
    spiritual: Number,
    adventure: Number,
    nature: Number,
    cultural: Number,
    photography: Number,
    shopping: Number,
    food: Number,
    relaxation: Number,
    nightlife: Number,
  },

  visitMetrics: {
    recommendedDays: Number,
    minimumDays: Number,
    popularityScore: Number,
    uniquenessScore: Number,
    culturalImportance: Number,
    isTransitHub: Boolean,
  },

  infrastructure: {
    accommodationAvailable: Boolean,
    hotelQualityAvg: Number,
    accessibilityScore: Number,
    familyFriendly: Number,
  }
}, { strict: false });

module.exports = mongoose.model('Destination', DestinationSchema, 'cities');