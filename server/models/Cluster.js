// server/models/Cluster.js
const mongoose = require('mongoose');

const clusterSchema = new mongoose.Schema({
  destinations: {
    type: [Number],
    required: true,
    validate: {
      validator: function(value) {
        return value.length >= 2;
      },
      message: 'A cluster must have at least 2 destinations.'
    }
  },
  type: {
    type: [String],
    required: true
  },
  minDays: {
    type: Number,
    required: true,
    min: 2
  },
  description: {
    type: String,
    required: true
  }
});

const Cluster = mongoose.model('Cluster', clusterSchema, 'clusters');

module.exports = Cluster;