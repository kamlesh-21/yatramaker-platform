// server/utils/calculateProportionalDistribution.js
const ActivityCollection = require('../models/ActivityCollection');

async function calculateProportionalDistribution(destinations, totalDuration) {
  const totalAttractions = await Promise.all(
    destinations.map(async (destination) => {
      const attractionCount = destination.localExpenses.attractions.length;
      const activityCollection = await ActivityCollection.findOne({ destination_id: destination.destination_id });
      const activitiesCount = activityCollection ? activityCollection.activities.length : 0;
      return attractionCount + activitiesCount;
    })
  );

  const totalCount = totalAttractions.reduce((sum, count) => sum + count, 0);
  const minDuration = 1;

  const durationDistribution = totalAttractions.map((count, index) => {
    const proportionalDuration = Math.round((count / totalCount) * (totalDuration - destinations.length * minDuration));
    return proportionalDuration + minDuration;
  });

  let remainingDuration = totalDuration - durationDistribution.reduce((sum, duration) => sum + duration, 0);
  for (let i = 0; i < durationDistribution.length && remainingDuration > 0; i++) {
    durationDistribution[i]++;
    remainingDuration--;
  }

  return durationDistribution;
}

module.exports = calculateProportionalDistribution;
