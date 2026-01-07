// server/routes/blog.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Contentful configuration
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_API_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master`;

// Get all blog posts
router.get('/posts', async (req, res) => {
  try {
    const response = await axios.get(`${CONTENTFUL_API_URL}/entries`, {
      params: {
        content_type: 'blogPage',
        order: '-sys.createdAt',
        limit: 18,
        include: 1, // Include linked entries and assets
      },
      headers: {
        Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts. Please try again later.' });
  }
});

// Get a single blog post by slug
router.get('/posts/:slug', async (req, res) => {
  try {
    const response = await axios.get(`${CONTENTFUL_API_URL}/entries`, {
      params: {
        content_type: 'blogPage',
        'fields.slug': req.params.slug,
        include: 1, // Include linked entries and assets
      },
      headers: {
        Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Error fetching blog post' });
  }
});

module.exports = router;