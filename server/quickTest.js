// server/utils/multiCity/quickTest.js
// ✅ Test multi-city logic WITHOUT hitting the API

const mongoose = require('mongoose');
require('dotenv').config();

const { expandAllPreferences } = require('./utils/multiCity/preferenceExpander');
const { buildClusters, getClusteringConfig } = require('./utils/multiCity/clusterBuilder');

async function quickTest() {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // ✅ Your exact payload
        const userLocation = {
            name: 'Dhanbad',
            latitude: 23.7954,
            longitude: 86.4270,
            state: 'Jharkhand'
        };
        
        const userQuery = {
            budget: 12000,
            tripDuration: 3,
            travellers: { adults: 1, children: 0, infants: 0 },
            accommodationPreference: 'Cheap',
            preferences: ['Cities', 'Jungles', 'Culture', 'Temples', 'Riverside']
        };
        
        console.log('📋 Test Payload:');
        console.log(`   From: ${userLocation.name}`);
        console.log(`   Budget: ₹${userQuery.budget}`);
        console.log(`   Duration: ${userQuery.tripDuration} days`);
        console.log(`   Preferences: ${userQuery.preferences.join(', ')}\n`);
        
        // ✅ TEST 1: Preference Expansion
        console.log('🔍 PHASE 1: Expanding preferences...');
        const preferenceMap = await expandAllPreferences(
            userQuery.preferences,
            userLocation,
            userQuery
        );
        
        const allDestinations = [];
        const seenIds = new Set();
        
        Object.entries(preferenceMap).forEach(([pref, dests]) => {
            console.log(`   ${pref}: ${dests.length} destinations`);
            dests.forEach(d => {
                if (!seenIds.has(d.destination_id)) {
                    seenIds.add(d.destination_id);
                    allDestinations.push(d);
                }
            });
        });
        
        console.log(`   ✅ Total unique: ${allDestinations.length}\n`);
        
        if (allDestinations.length === 0) {
            console.error('❌ FAIL: No destinations found!');
            console.error('   Check if your database has destinations with type values: Cities, Jungles, etc.');
            process.exit(1);
        }
        
        // ✅ Show top 5 destinations
        console.log('   Top 5 destinations:');
        allDestinations.slice(0, 5).forEach((d, i) => {
            console.log(`   ${i+1}. ${d.name} (${d.state}) - Score: ${d.preferenceScore}, Distance: ${Math.round(d.distanceFromUser)}km`);
        });
        console.log('');
        
        // ✅ TEST 2: Clustering
        console.log('🗺️  PHASE 2: Building clusters...');
        const config = getClusteringConfig(userQuery);
        console.log('   Config:', JSON.stringify(config, null, 2));
        
        const clusters = await buildClusters(allDestinations, userLocation, userQuery);
        console.log(`   ✅ Formed ${clusters.length} clusters\n`);
        
        if (clusters.length === 0) {
            console.warn('⚠️  WARNING: No clusters formed!');
            console.warn('   Possible reasons:');
            console.warn('   1. Destinations too far apart (>300km for your budget/duration)');
            console.warn('   2. Not enough destinations in same region');
            console.warn('   3. Infrastructure requirements too strict');
            console.warn('\n   Suggestions:');
            console.warn('   - Increase budget to ₹15,000+');
            console.warn('   - Extend trip to 5 days');
            console.warn('   - Reduce preferences to 1-2');
        } else {
            // Show cluster details
            clusters.forEach((cluster, i) => {
                const destNames = cluster.destinations.map(d => d.name).join(', ');
                console.log(`   Cluster ${i+1} (span: ${cluster.span}km):`);
                console.log(`      ${destNames}`);
                console.log(`      Score: ${cluster.score?.toFixed(2) || 'N/A'}\n`);
            });
        }
        
        await mongoose.connection.close();
        console.log('✅ Test complete\n');
        
        // ✅ Summary
        console.log('📊 SUMMARY:');
        console.log(`   Destinations found: ${allDestinations.length}`);
        console.log(`   Clusters formed: ${clusters.length}`);
        console.log(`   Expected routes: ${clusters.length * 2} (if route generation works)`);
        
        if (clusters.length > 0) {
            console.log('\n✅ Multi-city logic is working! You should get routes when calling the API.');
        } else {
            console.log('\n❌ Multi-city needs adjustment. See warnings above.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

quickTest();