//server/scrips/generateSitemap.js

require('dotenv').config();
const { createWriteStream } = require('fs');
const { SitemapStream } = require('sitemap');
const { resolve } = require('path');
const axios = require('axios');
const fs = require('fs');

// Contentful credentials
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_API_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master`;

const generateSitemap = async () => {
  try {
    // Backend sitemap path
    const backendSitemapPath = resolve(__dirname, '../public/sitemap.xml');

    const smStream = new SitemapStream({ hostname: 'https://yatramaker.com' });
    const pipeline = smStream.pipe(createWriteStream(backendSitemapPath));

    // Add static pages
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/blog', changefreq: 'weekly', priority: 0.9 });
    smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.7 });
    smStream.write({ url: '/search', changefreq: 'monthly', priority: 0.7 });
    smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.7 });
    smStream.write({ url: '/partner', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/news', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/faq', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/terms', changefreq: 'monthly', priority: 0.7 });
    smStream.write({ url: '/privacy', changefreq: 'monthly', priority: 0.7 });

    // Fetch blog posts from Contentful
    const response = await axios.get(`${CONTENTFUL_API_URL}/entries`, {
      params: { content_type: 'blogPage', order: '-sys.createdAt', limit: 1000 },
      headers: { Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}` },
    });

    const blogPosts = response.data.items || [];

    // Add blog post URLs to sitemap
    blogPosts.forEach(post => {
      if (post.fields && post.fields.slug) {
        smStream.write({
          url: `/blog/${post.fields.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: post.sys.updatedAt,
        });
      }
    });

    // End the stream
    smStream.end();

    // Wait for the pipeline to finish
    await new Promise((resolve, reject) => {
      pipeline.on('finish', resolve);
      pipeline.on('error', reject);
    });


    // Copy sitemap to frontend Vite project (cross-platform)
    const frontendSitemapPath = resolve(__dirname, '../../client/vite-project/public/sitemap.xml');
    fs.copyFileSync(backendSitemapPath, frontendSitemapPath);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
};

generateSitemap().catch(console.error);
// module.exports = { generateSitemap };
