const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Contact Information
  contactInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    preferredContact: { type: String, default: 'email' }
  },
  
  // User Search Data (mixed type - store as is)
  userSearchData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Destination Data (mixed type - store as is)
  destinationData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Travel Dates
  travelDates: {
    start: Date,
    end: Date
  },
  
  // Package Summary
  packageDetails: {
    destination: String,
    totalCost: Number,
    travelMode: String,
    priority: String
  },
  
  // Notes
  notes: String,
  
  // User Info (if logged in)
  userId: String,
  userEmail: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'contacted', 'quote_sent', 'converted', 'expired'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['quote_request', 'booking_request'],
    default: 'quote_request'
  },
  
  // Metadata
  source: { type: String, default: 'website' },
  ipAddress: String,
  userAgent: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  // Allow flexible schema
  strict: false
});

// Update updatedAt on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);