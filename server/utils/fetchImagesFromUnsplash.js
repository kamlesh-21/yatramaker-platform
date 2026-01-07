// // server/utils/fetchImagesFromUnsplash.js
// const axios = require('axios');

// const accessKey = '';

// // Function to fetch images from Unsplash
// async function fetchImagesFromUnsplash(destinationName, count) {
//   const url = `https://api.unsplash.com/search/photos`;
//   const params = {
//     query: destinationName,
//     per_page: count
//   };
//   const headers = {
//     Authorization: `Client-ID ${accessKey}`
//   };

//   // Log the query parameter and count
//   console.log(`Fetching images for query: ${params.query}, count: ${params.per_page}`);

//   // Validate the query parameter
//   if (!params.query || typeof params.query !== 'string' || params.query.trim() === '') {
//     console.error('Invalid query parameter:', params.query);
//     return [];
//   }

//   try {
//     const response = await axios.get(url, { params, headers });
//     return response.data.results.map(item => ({
//       url: item.urls.regular,
//       photographer_name: item.user.name,
//       unsplash_link: item.links.html,
//       title: item.alt_description || item.description,
//       description: item.description
//     }));
//   } catch (error) {
//     console.error('Error fetching images from Unsplash:', error.response ? error.response.data : error.message);
//     return []; // Return empty array on error
//   }
// }

// module.exports = { fetchImagesFromUnsplash };
