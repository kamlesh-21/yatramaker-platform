//server/models/Itinerary.js
const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries
    },
    budget: {
      type: Number,
      required: true,
    },
    userLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      state: String,
      nearest_hubs: {
        airports: [
          {
            name: String,
            code: String,
            city: String,
            distance_km: Number,
            latitude: Number,
            longitude: Number,
          },
        ],
        railway_stations: [
          {
            name: String,
            code: String,
            city: String,
            distance_km: Number,
            latitude: Number,
            longitude: Number,
          },
        ],
      },
    },
    tripDuration: {
      type: Number,
      required: true,
      min: 1,
    },
    travellers: {
      adults: {
        type: Number,
        required: true,
        min: 0,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
      infants: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    preferences: {
      type: [String],
      required: true,
    },
    accommodationPreference: {
      type: String,
      required: true,
      enum: ['Cheap', 'Comfort', 'Luxury'],
    },
    tripType: {
      type: String,
      enum: ['single-destination', 'multi-city'],
      default: 'multi-city',
    },
    singleDestinationRecommendation: {
      type: mongoose.Schema.Types.Mixed,
    },
    multiCityRecommendation: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Optional: Add metadata
    notes: String,
    isFavorite: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
ItinerarySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Itinerary', ItinerarySchema);