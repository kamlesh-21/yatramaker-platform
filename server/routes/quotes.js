const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');

// POST /api/quotes/request - Request a quote
router.post('/request', async (req, res) => {
  try {
    // Create quote in database
    const quote = new Quote({
      destination: req.body.destination,
      totalCost: req.body.totalCost,
      
      // Contact info
      contactInfo: {
        name: req.body.contactInfo?.name,
        email: req.body.contactInfo?.email,
        phone: req.body.contactInfo?.phone,
        preferredContact: req.body.contactInfo?.preferredContact || 'email'
      },
      
      // Package details
      packageDetails: {
        priority: req.body.packageDetails?.priority,
        travelMode: req.body.packageDetails?.travelMode,
        activities: req.body.packageDetails?.activities || [],
        breakdown: req.body.packageDetails?.breakdown || {}
      },
      
      // Travel dates
      travelDates: req.body.travelDates,
      notes: req.body.notes,
      
      // Status
      status: 'pending', // pending, sent, converted, expired
      
      // Metadata
      source: 'website',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await quote.save();

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