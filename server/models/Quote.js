const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  // Quote Info
  destination: String,
  totalCost: Number,
  
  // Contact Information
  contactInfo: {
    name: String,
    email: String,
    phone: String,
    preferredContact: { 
      type: String, 
      enum: ['whatsapp', 'email', 'phone'], 
      default: 'email' 
    }
  },
  
  // Package Details
  packageDetails: {
    priority: String, // cheapest, fastest, comfortable
    travelMode: String,
    activities: [{
      name: String,
      cost: Number
    }],
    breakdown: {
      travel: Number,
      accommodation: Number,
      localExpenses: Number,
      activities: Number
    }
  },
  
  // Travel Dates
  travelDates: {
    start: Date,
    end: Date
  },
  
  // Additional Info
  notes: String,
  source: { type: String, default: 'website' },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'converted', 'expired'], 
    default: 'pending' 
  },
  
  // Tracking
  ipAddress: String,
  userAgent: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
quoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Quote', quoteSchema);