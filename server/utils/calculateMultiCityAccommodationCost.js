// // server/utils/calculateMultiCityAccommodationCost.js

// server/utils/calculateMultiCityAccommodationCost.js
const HotelCollection = require('../models/HotelCollection');
const calculateProportionalDistribution = require('./calculateProportionalDistribution');
const { getFixedPrice, applyPriceAdjustment } = require('./pricingManager');

function findHotelsByCategory(hotels = [], requestedCategory) {
  if (!Array.isArray(hotels)) return [];
  if (!requestedCategory) return hotels;
  // case-insensitive match first
  const lc = String(requestedCategory).toLowerCase();
  const exact = hotels.filter(h => String(h.category || '').toLowerCase() === lc);
  if (exact.length) return exact;
  // fallback: cheap -> Cheap synonyms or categories with rates
  const fallbackOrder = ['cheap','budget','comfort','luxury'];
  // try next category in order
  for (const f of fallbackOrder) {
    if (f === lc) continue;
    const found = hotels.filter(h => String(h.category || '').toLowerCase() === f);
    if (found.length) return found;
  }
  // as last resort, return any hotels with a numeric rate
  return hotels.filter(h => typeof h.rate === 'number') || [];
}

async function calculateMultiCityAccommodationCost(destinations, accommodationPreference, tripDuration, travellers) {
  travellers = travellers || { adults: 1, children: 0, infants: 0 };
  const totalNights = Math.max(0, (tripDuration || 1) - 1);
  const dests = Array.isArray(destinations) ? destinations : [];

  const accommodationDurationDistribution = calculateProportionalDistribution(dests, totalNights);

  const accommodationCosts = await Promise.all(
    dests.map(async (destination, index) => {
      const nightsForThis = Math.max(1, Math.round(accommodationDurationDistribution[index] || 1));
      const hc = await HotelCollection.findOne({ destination_id: destination.destination_id }).lean().catch(() => null);
      if (!hc || !Array.isArray(hc.hotels) || hc.hotels.length === 0) {
        console.warn(`No hotel collection found for destination ID ${destination.destination_id}`);
        return null;
      }

      const hotels = findHotelsByCategory(hc.hotels, accommodationPreference);

      if (!hotels || hotels.length === 0) {
        console.warn(`No hotels found for preference ${accommodationPreference} in destination ID ${destination.destination_id}`);
        return null;
      }

      const averageNightlyRate = hotels.reduce((s, h) => s + (h.rate || 0), 0) / hotels.length;
      const adjustedNightlyRate = applyPriceAdjustment(averageNightlyRate, 'accommodation');

      const childRateMultiplier = getFixedPrice('childMealMultiplier') || 0.5;
      const roomOccupancyRatio = getFixedPrice('roomOccupancyRatio') || 2;

      const childRate = adjustedNightlyRate * childRateMultiplier;
      const totalAdults = travellers.adults || 1;
      const totalChildren = travellers.children || 0;

      // simplified room DP — keep same logic but defensive
      const dp = Array.from({ length: totalAdults + 1 }, () => Array(totalChildren + 1).fill(Infinity));
      dp[0][0] = 0;

      for (let a = 0; a <= totalAdults; a++) {
        for (let c = 0; c <= totalChildren; c++) {
          const cur = dp[a][c];
          if (!isFinite(cur)) continue;
          // Add room with up to 2 adults
          if (a + 2 <= totalAdults) dp[a + 2][c] = Math.min(dp[a + 2][c], cur + adjustedNightlyRate);
          // 1 adult + up to 1 child
          if (a + 1 <= totalAdults && c + 1 <= totalChildren) dp[a + 1][c + 1] = Math.min(dp[a + 1][c + 1], cur + adjustedNightlyRate);
          // up to 2 children
          if (c + 2 <= totalChildren) dp[a][c + 2] = Math.min(dp[a][c + 2], cur + adjustedNightlyRate);
          // 2 adults + 1 child
          if (a + 2 <= totalAdults && c + 1 <= totalChildren) dp[a + 2][c + 1] = Math.min(dp[a + 2][c + 1], cur + adjustedNightlyRate + childRate);
          // 1 adult + 2 children
          if (a + 1 <= totalAdults && c + 2 <= totalChildren) dp[a + 1][c + 2] = Math.min(dp[a + 1][c + 2], cur + adjustedNightlyRate + childRate);
          // edge: no children
          if (totalChildren === 0) {
            if (a + 2 <= totalAdults) dp[a + 2][0] = Math.min(dp[a + 2][0], cur + adjustedNightlyRate);
            if (a + 1 <= totalAdults) dp[a + 1][0] = Math.min(dp[a + 1][0], cur + adjustedNightlyRate);
          }
        }
      }

      const dpCost = dp[totalAdults] && dp[totalAdults][totalChildren];
      const perNightCost = isFinite(dpCost) ? dpCost : adjustedNightlyRate * Math.ceil((totalAdults + totalChildren * childRateMultiplier) / roomOccupancyRatio);
      const totalAccommodationCost = perNightCost * nightsForThis;
      const numberOfRooms = Math.ceil((totalAdults + (totalChildren * childRateMultiplier)) / roomOccupancyRatio);

      return {
        cost: Math.round(totalAccommodationCost),
        numberOfNights: nightsForThis,
        accommodationType: accommodationPreference,
        averageRate: Math.round(adjustedNightlyRate),
        numberOfRooms,
        destination_id: destination.destination_id,
      };
    })
  );

  const accommodationCostsFiltered = accommodationCosts.filter(Boolean);
  const total = accommodationCostsFiltered.reduce((s, a) => s + (a.cost || 0), 0);

  return {
    accommodationCosts: accommodationCostsFiltered,
    accommodationDurationDistribution,
    totalCost: Math.round(total)
  };
}

module.exports = calculateMultiCityAccommodationCost;
