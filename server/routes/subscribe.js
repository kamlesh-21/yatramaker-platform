// server/routes/subscribe.js
const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// POST /api/subscribe
router.post('/', async (req, res) => { // Adjusted route here
  const { email } = req.body;

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  try {
    // Check if the email belongs to an existing user
    const user = await User.findOne({ email });

    if (user) {
      if (user.subscribed) {
        return res.status(400).json({ success: false, message: 'Email already subscribed' });
      } else {
        user.subscribed = true;
        await user.save();
        // return res.json({ success: true, message: 'Subscribed successfully as a user' });
        return res.json({ success: true, message: 'Subscribed successfully' });

      }
    }

    // Check if email already exists in subscriptions
    const existingSubscription = await Subscription.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }

    // Create a new subscription for non-users
    const newSubscription = new Subscription({ email });
    await newSubscription.save();
    // res.json({ success: true, message: 'Subscribed successfully as a non-user' });
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
