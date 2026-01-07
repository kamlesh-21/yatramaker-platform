// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const crypto = require('crypto'); // add this new line
const User = require('../models/User');
const auth = require('../middleware/auth');
const Itinerary = require('../models/Itinerary'); 

const { sendRegistrationNotification, sendAdminNotification, sendPasswordResetEmail } = require('../utils/sendEmail');

// Add the admin email address
const ADMIN_EMAIL = 'makeayatra@gmail.com'; // Replace with your email address

// Register a new user
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => { 
    // console.log('Request body:', req.body); // Add this line to log the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log('Validation errors:', errors.array()); // Add this line to log validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, subscribed } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        name,
        email,
        password,
        subscribed,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // Send notification emails
      sendRegistrationNotification(email, name);
      sendAdminNotification(ADMIN_EMAIL, name, email);
      
    } catch (err) {
      console.error('Registration error:', err); // Log the actual error
      res.status(500).json({ msg: 'Server error', err }); // Send a more descriptive error message
    }
  }
);

// Authenticate user and get token
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Login error:', err); // Log the actual error
      res.status(500).json({ msg: 'Server error', err }); // Send a more descriptive error message
    }
  }
);

//add new route for forgot password and reset password

router.post(
  '/forgot-password',
  [check('email', 'Please include a valid email').isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'User not found' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = resetTokenExpiry;

      await user.save();

      sendPasswordResetEmail(email, resetToken);
      res.json({ msg: 'Password reset email sent' });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ msg: 'Server error', err });
    }
  }
);

router.post(
  '/reset-password',
  [
    check('token', 'Token is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    try {
      let user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid or expired token' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;

      await user.save();
      res.json({ msg: 'Password reset successful' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ msg: 'Server error', err });
    }
  }
);

// // ============================================
// // ITINERARY ROUTES (NEW - ENHANCED)
// // ============================================

// // @route   POST /api/auth/itineraries
// // @desc    Save a new itinerary
// // @access  Private
// router.post('/itineraries', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     const newItinerary = new Itinerary({
//       ...req.body,
//       userId: req.user.id,
//     });

//     const savedItinerary = await newItinerary.save();
//     user.itineraries.push(savedItinerary._id);
//     await user.save();

//     res.json({
//       msg: 'Itinerary saved successfully',
//       itinerary: savedItinerary,
//     });
//   } catch (err) {
//     console.error('Error saving itinerary:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// });

router.post('/itineraries', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const { tripType, singleDestinationRecommendation, multiCityRecommendation } = req.body;
    if (tripType === 'single-destination' && !singleDestinationRecommendation) {
      return res.status(400).json({ msg: 'Missing singleDestinationRecommendation for single-destination trip' });
    }
    if (tripType === 'multi-city' && !multiCityRecommendation) {
      return res.status(400).json({ msg: 'Missing multiCityRecommendation for multi-city trip' });
    }
    const newItinerary = new Itinerary({
      ...req.body,
      userId: req.user.id,
    });
    const savedItinerary = await newItinerary.save();
    user.itineraries.push(savedItinerary._id);
    await user.save();
    res.json({
      msg: 'Itinerary saved successfully',
      itinerary: savedItinerary,
    });
  } catch (err) {
    console.error('Error saving itinerary:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET /api/auth/itineraries
// @desc    Get all user itineraries with pagination
// @access  Private
router.get('/itineraries', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'itineraries',
        options: {
          sort: { createdAt: -1 },
          skip,
          limit,
        },
      });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const totalItineraries = await Itinerary.countDocuments({ userId: req.user.id });

    res.json({
      itineraries: user.itineraries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItineraries / limit),
        totalItems: totalItineraries,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    console.error('Error fetching itineraries:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET /api/auth/itineraries/:id
// @desc    Get single itinerary by ID
// @access  Private
router.get('/itineraries/:id', auth, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ msg: 'Itinerary not found' });
    }

    if (itinerary.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(itinerary);
  } catch (err) {
    console.error('Error fetching itinerary:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Itinerary not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


// server/routes/auth.js
// Add this route AFTER the GET /itineraries/:id route

// @route   PATCH /api/auth/itineraries/:id
// @desc    Update itinerary (for favorite toggle, notes, etc.)
// @access  Private
router.patch('/itineraries/:id', auth, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ msg: 'Itinerary not found' });
    }

    if (itinerary.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Update only allowed fields
    const allowedUpdates = ['isFavorite', 'notes', 'tags'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      msg: 'Itinerary updated successfully',
      itinerary: updatedItinerary,
    });
  } catch (err) {
    console.error('Error updating itinerary:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Itinerary not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


// @route   DELETE /api/auth/itineraries/:id
// @desc    Delete an itinerary
// @access  Private
router.delete('/itineraries/:id', auth, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ msg: 'Itinerary not found' });
    }

    if (itinerary.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Itinerary.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { itineraries: req.params.id },
    });

    res.json({ msg: 'Itinerary deleted successfully' });
  } catch (err) {
    console.error('Error deleting itinerary:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Itinerary not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
