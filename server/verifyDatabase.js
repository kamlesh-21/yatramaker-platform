// server/utils/multiCity/verifyDatabase.js

const Destination = require('./models/Destination');
const mongoose = require('mongoose');
require('dotenv').config();

async function verifyDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        // TEST 1: Count total destinations
        await Destination.countDocuments();

        // TEST 2: Check values in "type" field
        await Destination.aggregate([
            { $unwind: '$type' },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // TEST 3: Find destinations near Dhanbad
        const dhanbadLat = 23.7954;
        const dhanbadLon = 86.4270;

        await Destination.find({
            latitude: { $gte: dhanbadLat - 5, $lte: dhanbadLat + 5 },
            longitude: { $gte: dhanbadLon - 5, $lte: dhanbadLon + 5 }
        })
        .select('destination_id name type state')
        .lean();

        // TEST 4: Preference queries
        const preferences = [
            'Mountains',
            'Beaches',
            'Cities',
            'Jungles',
            'Temples',
            'Riverside',
            'Culture',
            'Desert'
        ];

        for (const pref of preferences) {
            const count = await Destination.countDocuments({ type: pref });

            if (count > 0) {
                await Destination.findOne({ type: pref })
                    .select('name type experienceProfile')
                    .lean();
            }
        }

        // TEST 5: Cities check
        const citiesCount = await Destination.countDocuments({ type: 'Cities' });

        if (citiesCount > 0) {
            await Destination.find({ type: 'Cities' })
                .select('name state type')
                .limit(5)
                .lean();
        }

        // TEST 6: Sample destination structure
        await Destination.findOne().lean();

        await mongoose.connection.close();

    } catch (error) {
        console.error('Database verification failed:', error);
        process.exit(1);
    }
}

// Run verification
verifyDatabase();
