// scheduleGenerator.js
//

/**
 * Generates all valid non-conflicting schedule combinations from a list of timeslot groups.
 * each group represents different options (e.g., tutorials, lectures) for a subject.
 */
export function getSchedules(timeslotGroups) {
  const currentCombination = [];

  // automatically select subjects with only one timeslot option
  // and remove them from the main pool (one timeslot = no other alternative combination)
  for (const group of timeslotGroups) {
    if (group.length == 1) {
      // remove from timeslotGroups
      currentCombination.push(group[0]);
      timeslotGroups.splice(timeslotGroups.indexOf(group), 1);
    }
  }

  const validSchedules = [];

  // recursive backtracking function to generate all valid combinations
  function generateCombination(index, currentCombination) {
    if (index === timeslotGroups.length) {
      // Base case: all groups processed, add current combo as valid schedule
      validSchedules.push(currentCombination);

      return;
    }
    const group = timeslotGroups[index];

    for (const slot of group) {
      // check if the slot conflicts with any already selected slots
      const conflict = currentCombination.some(
        (existingSlot) =>
          existingSlot.day === slot.day &&
          timeslotOverlap(
            existingSlot.time,
            existingSlot.duration,
            slot.time,
            slot.duration
          )
      );

      if (conflict) continue; // skip this slot if it overlaps

      // Recursively continue with this slot added
      generateCombination(index + 1, [...currentCombination, slot]);
    }
  }

  generateCombination(0, currentCombination);
  return validSchedules;
}

/**
 * Determines if two timeslots overlap.
 */
function timeslotOverlap(startTime1, duration1, startTime2, duration2) {
  // convert start times to minutes from midnight
  const s1Minutes =
    parseInt(startTime1.substring(0, 2)) * 60 +
    parseInt(startTime1.substring(3, 5));
  const s2Minutes =
    parseInt(startTime2.substring(0, 2)) * 60 +
    parseInt(startTime2.substring(3, 5));

  // convert durations to numbers (assumed to be in minutes)
  const e1Minutes = s1Minutes + parseInt(duration1);
  const e2Minutes = s2Minutes + parseInt(duration2);

  // Check for overlap: (start1 < end2) and (start2 < end1)
  return s1Minutes < e2Minutes && s2Minutes < e1Minutes;
}
