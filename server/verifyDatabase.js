// server/utils/multiCity/verifyDatabase.js
// ✅ Run this to see what's ACTUALLY in your database

const Destination = require('./models/Destination');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan'); // Import morgan
const cors = require('cors')

require('dotenv').config();

const app = express();
app.use(cors())

async function verifyDatabase() {
    try {
        // Connect to MongoDB
        await mongoose
          .connect(process.env.MONGODB_URI, {
            // Remove deprecated options
          })
        console.log('✅ Connected to MongoDB\n');
        
        // ✅ TEST 1: Count total destinations
        const totalCount = await Destination.countDocuments();
        console.log(`📊 Total destinations in database: ${totalCount}\n`);
        
        // ✅ TEST 2: Check what values exist in "type" field
        const typeAggregation = await Destination.aggregate([
            { $unwind: '$type' },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('📝 Actual "type" values in database:');
        typeAggregation.forEach(item => {
            console.log(`   "${item._id}": ${item.count} destinations`);
        });
        console.log('');
        
        // ✅ TEST 3: Find destinations near Dhanbad
        const dhanbadLat = 23.7954;
        const dhanbadLon = 86.4270;
        
        const nearbyDests = await Destination.find({
            latitude: { $gte: dhanbadLat - 5, $lte: dhanbadLat + 5 },
            longitude: { $gte: dhanbadLon - 5, $lte: dhanbadLon + 5 }
        }).select('destination_id name type state').lean();
        
        console.log(`🗺️  Destinations within ~500km of Dhanbad: ${nearbyDests.length}`);
        nearbyDests.slice(0, 5).forEach(d => {
            console.log(`   - ${d.name} (${d.state}): [${d.type.join(', ')}]`);
        });
        console.log('');
        
        // ✅ TEST 4: Test each preference query
        const preferences = ['Mountains', 'Beaches', 'Cities', 'Jungles', 'Temples', 'Riverside', 'Culture', 'Desert'];
        
        console.log('🎯 Testing preference queries:');
        for (const pref of preferences) {
            const count = await Destination.countDocuments({ type: pref });
            console.log(`   ${pref}: ${count} destinations`);
            
            if (count > 0) {
                const sample = await Destination.findOne({ type: pref })
                    .select('name type experienceProfile')
                    .lean();
                
                console.log(`      Example: ${sample.name}`);
                console.log(`      Types: [${sample.type.join(', ')}]`);
                console.log(`      Experience: nature=${sample.experienceProfile?.nature || 0}, spiritual=${sample.experienceProfile?.spiritual || 0}`);
            }
        }
        console.log('');
        
        // ✅ TEST 5: Check if "Cities" type exists
        const citiesCount = await Destination.countDocuments({ type: 'Cities' });
        console.log(`🏙️  Destinations with type="Cities": ${citiesCount}`);
        
        if (citiesCount > 0) {
            const citySamples = await Destination.find({ type: 'Cities' })
                .select('name state type')
                .limit(5)
                .lean();
            
            console.log('   Examples:');
            citySamples.forEach(c => {
                console.log(`   - ${c.name} (${c.state})`);
            });
        } else {
            console.log('   ⚠️ WARNING: No destinations found with type="Cities"');
            console.log('   This means your database might use different type values!');
        }
        console.log('');
        
        // ✅ TEST 6: Sample a random destination to see full structure
        const sample = await Destination.findOne().lean();
        console.log('📋 Sample destination structure:');
        console.log(JSON.stringify({
            destination_id: sample.destination_id,
            name: sample.name,
            type: sample.type,
            state: sample.state,
            hasExperienceProfile: !!sample.experienceProfile,
            hasVisitMetrics: !!sample.visitMetrics,
            hasInfrastructure: !!sample.infrastructure,
            hasTravel: !!sample.travel,
            experienceProfileKeys: sample.experienceProfile ? Object.keys(sample.experienceProfile) : [],
            sampleExperienceScores: sample.experienceProfile ? {
                nature: sample.experienceProfile.nature,
                cultural: sample.experienceProfile.cultural,
                spiritual: sample.experienceProfile.spiritual
            } : null
        }, null, 2));
        
        await mongoose.connection.close();
        console.log('\n✅ Database verification complete');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run verification
verifyDatabase();