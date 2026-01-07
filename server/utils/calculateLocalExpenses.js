// // server/utils/calculateLocalExpenses.js
const ActivityCollection = require('../models/ActivityCollection');
const { getFixedPrice, applyPriceAdjustment } = require('./pricingManager');

async function calculateLocalExpenses(destination, accommodationPreference, duration, travellers) {
  const { transportation, meals, attractions } = destination.localExpenses;

  // Calculate and adjust transportation cost
  let transportationCost = transportation * duration;
  transportationCost = applyPriceAdjustment(transportationCost, 'transportation');

  // Calculate and adjust meal cost based on accommodation preference
  let adultMealCost;
  if (accommodationPreference === 'Comfort') {
    adultMealCost = meals.midrange * duration;
  } else if (accommodationPreference === 'Cheap') {
    adultMealCost = meals.budget * duration;
  } else if (accommodationPreference === 'Luxury') {
    adultMealCost = meals.luxury * duration;
  } else {
    adultMealCost = meals.midrange * duration;  // Default to midrange if undefined
  }

  // Apply meal adjustment
  adultMealCost = applyPriceAdjustment(adultMealCost, 'meals');
  const childMealCost = adultMealCost * getFixedPrice('childMealMultiplier');
  const mealsCost = (travellers.adults * adultMealCost) + (travellers.children * childMealCost);

  // Calculate and sum attractions cost without adjustment
  // const attractionsCost = attractions.reduce((sum, attraction) => sum + attraction.cost, 0);
  // ✅ CRITICAL FIX: Scale attractions by traveler count (entry tickets are per-person)
  const attractionsCost = attractions.reduce((sum, attraction) => {
      const adultCost = attraction.cost || 0;
      const childMultiplier = getFixedPrice('childMealMultiplier') || 0.5;
      const childCost = adultCost * childMultiplier;
      
      // Per-person cost for attractions (monument entry, museum tickets, etc.)
      const totalAttractionCost = (travellers.adults * adultCost) + 
                                  (travellers.children * childCost);
      
      return sum + totalAttractionCost;
  }, 0);
  // Calculate total local expenses cost before adjustments
  const localExpensesCost = transportationCost + mealsCost + attractionsCost;

  // Fetch and calculate adjusted activities cost
  const activityCollection = await ActivityCollection.findOne({ destination_id: destination.destination_id });
  const activities = activityCollection ? activityCollection.activities.map(activity => {
    const adjustedCost = applyPriceAdjustment(activity.cost, 'activities');
    return {
      ...activity._doc,  // Keep other activity properties intact
      cost: adjustedCost,
    };
  }) : [];

  const activitiesCost = activities.reduce((sum, activity) => {
    const childCost = activity.cost * getFixedPrice('childMealMultiplier');
    return sum + (travellers.adults * activity.cost) + (travellers.children * childCost);
  }, 0);

  // Return the adjusted total costs as well as individual component costs
  return {
    transportationCost,
    mealsCost,
    attractionsCost,
    localExpensesCost,
    activities,
    activitiesCost,  // This is now the adjusted activities cost
  };
}

module.exports = calculateLocalExpenses;
