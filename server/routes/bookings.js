const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings/create
router.post('/create', async (req, res) => {
  try {  
    // Check if destinationData is a string (incorrectly sent)
    let destinationData = req.body.destinationData;
    if (typeof destinationData === 'string') {
      try {
        destinationData = JSON.parse(destinationData);
      } catch (parseError) {
        console.error('❌ Failed to parse destinationData:', parseError);
        // Keep as is if parsing fails
      }
    }
    
    const bookingData = {
      // Contact info
      contactInfo: req.body.contactInfo || {},
      
      // User search preferences
      userSearchData: req.body.userSearchData || {},
      
      // Destination details - Ensure it's an object
      destinationData: destinationData || {},
      
      // Travel dates
      travelDates: req.body.travelDates || {},
      
      // Package summary
      packageDetails: req.body.packageDetails || {},
      
      // Notes
      notes: req.body.notes || '',
      
      // User info if available
      ...(req.body.userId && { userId: req.body.userId }),
      ...(req.body.userEmail && { userEmail: req.body.userEmail }),
      
      // Status
      status: 'pending',
      type: req.body.type || 'quote_request',
      source: req.body.source || 'website',
      
      // Metadata
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const booking = new Booking(bookingData);
    await booking.save();

    res.json({
      success: true,
      message: 'Quote request received successfully',
      bookingId: booking._id,
      debug: {
        receivedDataTypes: {
          destinationData: typeof req.body.destinationData,
          userSearchData: typeof req.body.userSearchData,
          contactInfo: typeof req.body.contactInfo
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Booking error:', error.message);
    console.error('❌ Full error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Please try again or contact support',
      debug: {
        receivedBody: {
          destinationDataType: typeof req.body?.destinationData,
          destinationDataSample: req.body?.destinationData?.substring 
            ? req.body.destinationData.substring(0, 100) + '...' 
            : req.body?.destinationData
        }
      }
    });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;