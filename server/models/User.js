const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  itineraries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary'
    }
  ],
  subscribed: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpiry: {
    type: Date,
  },
});

module.exports = mongoose.model('User', UserSchema);
