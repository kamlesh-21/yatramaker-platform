const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');

// POST /api/quotes/request - Request a quote
router.post('/request', async (req, res) => {
  try {
    // console.log('🔍 QUOTE REQUEST RECEIVED:', req.body);

    const quote = new Quote({
      // Pull from nested fields
      destination: req.body.destinationData?.name || req.body.packageDetails?.destination || "Unknown",
      totalCost: req.body.destinationData?.totalCost || req.body.packageDetails?.totalCost || 0,

      contactInfo: req.body.contactInfo || {},
      
      packageDetails: {
        priority: req.body.packageDetails?.priority || req.body.destinationData?.selectedVariant || "unknown",
        travelMode: req.body.packageDetails?.travelMode || req.body.destinationData?.selectedTravelMode || "unknown",
        activities: req.body.destinationData?.selectedActivities || [],
        breakdown: req.body.destinationData?.breakdown || {}
      },

      travelDates: req.body.travelDates || {},
      notes: req.body.notes || '',
      
      source: req.body.source || 'website',
      status: 'pending',

      // Add more useful fields for your quotes
      userSearchData: req.body.userSearchData || {},          // ← Save full search!
      destinationData: req.body.destinationData || {},        // ← Save full destination!
      
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await quote.save();
    console.log('✅ Quote saved:', quote._id);

    // Simple console notification (expand to email later)
    // console.log(`
    //   NEW QUOTE REQUEST!
    //   Destination: ${quote.destination}
    //   Total Cost: ₹${quote.totalCost}
    //   Name: ${quote.contactInfo?.name}
    //   Email: ${quote.contactInfo?.email}
    //   Phone: ${quote.contactInfo?.phone}
    //   -------------------
    // `);
    console.log('✅ Quote saved:', quote._id);
    
    res.json({
      success: true,
      message: 'Quote request received successfully!',
      quoteId: quote._id,
      nextSteps: [
        'You will receive a detailed quote within 24 hours',
        'Check your email for confirmation',
        'For urgent queries, contact us on WhatsApp'
      ]
    });

  } catch (error) {
    console.error('❌ Quote request error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to process quote request. Please try again or contact us directly.'
    });
  }
});

// GET /api/quotes/:id - Get quote by ID
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quote not found' 
      });
    }
    
    res.json({ 
      success: true, 
      quote 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/quotes - List quotes (admin only)
router.get('/', async (req, res) => {
  try {
    // Add authentication middleware here
    const quotes = await Quote.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ 
      success: true, 
      count: quotes.length,
      quotes 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;