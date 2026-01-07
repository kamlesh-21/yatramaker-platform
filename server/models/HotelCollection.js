// server/models/HotelCollection.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  hotel_id: { type: Number, required: true },
  address: { type: String, required: true },
  contact_no: { type: String, required: true },
  email: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  rate: { type: Number, required: true },
  images: [String]
});

const hotelCollectionSchema = new mongoose.Schema({
  destination_id: { type: Number, required: true, unique: true },
  hotels: [hotelSchema]
});

const HotelCollection = mongoose.model('HotelCollection', hotelCollectionSchema, 'hotel_collections');

module.exports = HotelCollection;