// server/routes/hotelData.js
const express = require('express');
const router = express.Router();
const HotelCollection = require('../models/HotelCollection');
const { applyPriceAdjustment } = require('../utils/pricingManager'); // Import applyPriceAdjustment function

router.get('/', async (req, res) => {
  try {
    const { destination_id, category } = req.query;
    const hotelCollection = await HotelCollection.findOne({ destination_id: parseInt(destination_id) });

    if (!hotelCollection) {
      return res.status(404).json({ error: 'Hotel collection not found' });
    }

    const hotels = hotelCollection.hotels.filter(hotel => {
      if (category) {
        return hotel.category === category;
      }
      return true;
    });

    // Apply price adjustments and round the rates
    const adjustedHotels = hotels.map(hotel => {
      const adjustedRate = applyPriceAdjustment(hotel.rate, 'accommodation');
      const roundedRate = Math.round(adjustedRate * 100) / 100; // Round to 2 decimal places
      return {
        ...hotel._doc,
        rate: roundedRate // Override the rate with the rounded adjusted value
      };
    });

    res.json(adjustedHotels); // Return the adjusted hotels
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
