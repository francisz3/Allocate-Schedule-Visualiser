export function getSchedules(timeslotGroups) {
  const currentCombination = [];

  // try find the days that are high priority add them to schedule
  // drop added classes from timeslotGroups
  for (const group of timeslotGroups) {
    if (group.length == 1) {
      // remove from timeslotGroups
      currentCombination.push(group[0]);
      timeslotGroups.splice(timeslotGroups.indexOf(group), 1);
    }
  }

  // check if days
  const validSchedules = [];

  function generateCombination(index, currentCombination) {
    if (index === timeslotGroups.length) {
      // If we've assigned all courses, check if it meets the requirements
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

      if (conflict) continue;

      generateCombination(index + 1, [...currentCombination, slot]);
    }
  }

  generateCombination(0, currentCombination);
  return validSchedules;
}

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

  // overlap condition: start1 < end2 && start2 < end1
  return s1Minutes < e2Minutes && s2Minutes < e1Minutes;
}
