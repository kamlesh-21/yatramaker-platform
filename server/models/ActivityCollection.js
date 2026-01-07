// server/models/ActivityCollection.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  activity_type: { type: String, required: true },
  period: { type: String, required: true },
  cost_category: { type: String, required: true },
  travel_period: { type: String, required: true },
  images: { type: [String] }  // Optional field for images
});

const activityCollectionSchema = new mongoose.Schema({
  destination_id: { type: Number, required: true, unique: true },
  activities: [activitySchema]
});

const ActivityCollection = mongoose.model('ActivityCollection', activityCollectionSchema, 'activity_collections');

module.exports = ActivityCollection;
