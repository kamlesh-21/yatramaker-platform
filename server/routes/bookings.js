const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings/create
router.post('/create', async (req, res) => {
  try {
    // console.log('🔍 BOOKING CREATE - Full received payload:', JSON.stringify(req.body, null, 2));

    // No need for string parsing — your frontend already sends objects
    const bookingData = {
      contactInfo: req.body.contactInfo || {},
      
      // Save the full rich objects (this is the key fix!)
      userSearchData: req.body.userSearchData || {},
      destinationData: req.body.destinationData || {},
      
      travelDates: req.body.travelDates || {},
      notes: req.body.notes || '',
      
      packageDetails: req.body.packageDetails || {},
      
      // User info
      ...(req.body.userId && { userId: req.body.userId }),
      ...(req.body.userEmail && { userEmail: req.body.userEmail }),
      
      // Status & metadata
      status: req.body.status || 'pending',
      type: req.body.type || 'quote_request',
      source: req.body.source || 'website',
      
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // console.log('🔍 Prepared bookingData for save:', JSON.stringify(bookingData, null, 2));

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking saved successfully:', booking._id);

    // Better notification
    // console.log(`
    //   NEW BOOKING/QUOTE REQUEST!
    //   Destination: ${booking.destinationData?.name || 'N/A'}
    //   Total Cost: ₹${booking.destinationData?.totalCost || 'N/A'}
    //   Budget: ₹${booking.userSearchData?.budget || 'N/A'}
    //   Preferences: ${booking.userSearchData?.preferences?.join(', ') || 'N/A'}
    //   Name: ${booking.contactInfo?.name || 'N/A'}
    //   Email: ${booking.contactInfo?.email || 'N/A'}
    //   Phone: ${booking.contactInfo?.phone || 'N/A'}
    //   -------------------
    // `);

    res.json({
      success: true,
      message: 'Request received successfully',
      bookingId: booking._id
    });

  } catch (error) {
    console.error('❌ Booking error details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
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