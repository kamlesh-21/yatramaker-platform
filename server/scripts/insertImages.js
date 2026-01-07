// // server/scripts/insertImages.js

// require('dotenv').config({ path: '../.env' });
// const mongoose = require('mongoose');
// const Destination = require('../models/Destination');
// const { fetchImagesFromUnsplash } = require('../utils/fetchImagesFromUnsplash');

// async function main(destinationsToProcess) {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('Connected to MongoDB');

//     // Fetch specified destinations from MongoDB
//     const destinations = await Destination.find({}).skip(destinationsToProcess.startIndex).limit(destinationsToProcess.batchSize);

//     // Process each destination
//     for (let destination of destinations) {
//       const destinationName = String(destination.name);
//       const count = 4; // Set the number of images to fetch
//       const images = await fetchImagesFromUnsplash(destinationName, count);

//       if (images.length > 0) {
//         // Update the destination document in MongoDB with images
//         await Destination.updateOne(
//           { _id: destination._id },
//           { $set: { images: images } }
//         );
//         console.log(`Images insertion for ${destinationName} successful`);
//       } else {
//         console.log(`No images fetched for ${destinationName}`);
//       }
//     }

//     // Close the MongoDB connection
//     await mongoose.connection.close();
//     console.log('Disconnected from MongoDB');
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// // Example usage: Fetch images for destinations 10-19
// const destinationsToProcess = {
//   startIndex: 154,
//   batchSize: 48
// };

// // Execute the main function with the specified batch
// main(destinationsToProcess);


// // /*
// //   to run it, inside server folder type 
// //   1. cd scripts  
// //   2. node insertImages.js
// // */
