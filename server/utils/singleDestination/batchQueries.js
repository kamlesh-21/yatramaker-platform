/**
 * BATCH QUERIES HELPER
 * Optimizes database queries for bulk destination enhancement
 * 
 * Instead of 1000 individual queries, does 2-3 batch queries
 * 
 * @file server/utils/singleDestination/batchQueries.js
 */

const HotelCollection = require('../../models/HotelCollection');
const ActivityCollection = require('../../models/ActivityCollection');

/**
 * Fetch hotels and activities for multiple destinations in batch
 * @param {Array} destinationIds - Array of destination IDs
 * @returns {Object} Maps of hotels and activities by destination_id
 */
async function fetchBatchData(destinationIds) {
  try {
    // Batch query 1: Fetch all hotels
    const hotelsArray = await HotelCollection.find({
      destination_id: { $in: destinationIds }
    }).lean();

    // Batch query 2: Fetch all activities
    const activitiesArray = await ActivityCollection.find({
      destination_id: { $in: destinationIds }
    }).lean();

    // Convert arrays to maps for O(1) lookup
    const hotelsMap = new Map(
      hotelsArray.map(hotel => [hotel.destination_id, hotel])
    );

    const activitiesMap = new Map(
      activitiesArray.map(activity => [activity.destination_id, activity])
    );

    return {
      hotelsMap,
      activitiesMap
    };
  } catch (error) {
    console.error('Error fetching batch data:', error);
    return {
      hotelsMap: new Map(),
      activitiesMap: new Map()
    };
  }
}

/**
 * Get hotel for a specific destination (from pre-fetched map)
 * @param {Number} destinationId
 * @param {Map} hotelsMap
 * @returns {Object|null}
 */
function getHotelFromMap(destinationId, hotelsMap) {
  return hotelsMap.get(destinationId) || null;
}

/**
 * Get activities for a specific destination (from pre-fetched map)
 * @param {Number} destinationId
 * @param {Map} activitiesMap
 * @returns {Array}
 */
function getActivitiesFromMap(destinationId, activitiesMap) {
  const collection = activitiesMap.get(destinationId);
  return collection?.activities || [];
}

module.exports = {
  fetchBatchData,
  getHotelFromMap,
  getActivitiesFromMap
};