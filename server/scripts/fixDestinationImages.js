// server/scripts/fixDestinationImages.js
// ✅ RUN THIS ONCE to fetch proper images for each destination

const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const axios = require('axios');
require('dotenv').config();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'YOUR_KEY_HERE';

async function fetchRelevantImages(destinationName, destinationType) {
    try {
        // Build search query based on destination
        const searchQuery = `${destinationName} India ${destinationType[0] || ''}`;
        
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query: searchQuery,
                per_page: 3,
                orientation: 'landscape'
            },
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });
        
        if (response.data.results.length === 0) {
            console.log(`   ⚠️ No images found for "${searchQuery}", trying generic...`);
            
            // Fallback to type-based search
            const fallbackQuery = `${destinationType[0]} India`;
            const fallbackResponse = await axios.get('https://api.unsplash.com/search/photos', {
                params: {
                    query: fallbackQuery,
                    per_page: 3,
                    orientation: 'landscape'
                },
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                }
            });
            
            return fallbackResponse.data.results;
        }
        
        return response.data.results;
        
    } catch (error) {
        console.error(`   ❌ Error fetching images: ${error.message}`);
        return [];
    }
}

async function fixAllDestinationImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        const destinations = await Destination.find({}).lean();
        console.log(`📸 Fixing images for ${destinations.length} destinations...\n`);
        
        for (const dest of destinations) {
            const destName = Array.isArray(dest.name) ? dest.name[0] : dest.name;
            const destType = dest.type || [];
            
            console.log(`Processing: ${destName} (${destType.join(', ')})`);
            
            // Check if images are already good
            const hasRelevantImages = dest.images && dest.images.length > 0 && 
                                      dest.images[0].title.toLowerCase().includes(destName.toLowerCase().split(' ')[0]);
            
            if (hasRelevantImages) {
                console.log(`   ✅ Already has relevant images, skipping\n`);
                continue;
            }
            
            // Fetch new images
            const unsplashResults = await fetchRelevantImages(destName, destType);
            
            if (unsplashResults.length === 0) {
                console.log(`   ⚠️ Could not find images, keeping existing\n`);
                continue;
            }
            
            // Format images
            const newImages = unsplashResults.map(photo => ({
                url: photo.urls.regular,
                photographer_name: photo.user.name,
                unsplash_link: photo.links.html,
                title: photo.alt_description || photo.description || `${destName} view`,
                description: photo.description || `Beautiful view of ${destName}`
            }));
            
            // Update database
            await Destination.updateOne(
                { destination_id: dest.destination_id },
                { $set: { images: newImages } }
            );
            
            console.log(`   ✅ Updated with ${newImages.length} new images\n`);
            
            // Rate limit: 50 requests per hour
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('\n✅ Image fix complete!');
        await mongoose.connection.close();
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run
fixAllDestinationImages();

// ⚠️ ALTERNATIVE: If you don't have Unsplash API key
// Use destination-specific fallback images from your existing data
async function useFallbackImages() {
    const destinations = await Destination.find({}).lean();
    
    for (const dest of destinations) {
        const destName = Array.isArray(dest.name) ? dest.name[0] : dest.name;
        const destType = dest.type[0] || 'india';
        
        // Use placeholder images based on type
        const placeholderImages = [
            {
                url: `https://source.unsplash.com/800x600/?${destName.replace(/\s/g, '-')},india`,
                photographer_name: 'Unsplash Community',
                unsplash_link: 'https://unsplash.com',
                title: `${destName} landscape`,
                description: `Scenic view of ${destName}`
            },
            {
                url: `https://source.unsplash.com/800x600/?${destType},india`,
                photographer_name: 'Unsplash Community',
                unsplash_link: 'https://unsplash.com',
                title: `${destName} ${destType}`,
                description: `${destType} experience in ${destName}`
            },
            {
                url: `https://source.unsplash.com/800x600/?travel,india`,
                photographer_name: 'Unsplash Community',
                unsplash_link: 'https://unsplash.com',
                title: `India travel`,
                description: `Travel destination`
            }
        ];
        
        await Destination.updateOne(
            { destination_id: dest.destination_id },
            { $set: { images: placeholderImages } }
        );
    }
}

// To use fallback: node server/scripts/fixDestinationImages.js --fallback