// utils.js
// Misc util functions shared across app
import { store } from "./store.js";
import { loadSchedules } from "./scheduleRenderer.js";

/**
 *    Gets details of schedule to preview what days at uni the schedule will have and the earliest and latest time
 **/
export function getScheduleDetails(schedule) {
  const scheduleDetails = [];
  const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  // Find which days the student has to be at uni

  // Count occurrences of each day
  const dayCounts = schedule.reduce((acc, item) => {
    acc[item.day] = (acc[item.day] || 0) + 1;
    return acc;
  }, {});

  // Sort the result based on the daysOrder
  const sortedDayCounts = Object.fromEntries(
    Object.entries(dayCounts).sort(
      (a, b) => daysOrder.indexOf(a[0]) - daysOrder.indexOf(b[0])
    )
  );

  scheduleDetails.push(sortedDayCounts);

  // Find the earliest and latest time
  const times = schedule.map((timeslot) => timeslot.time);

  const earliestTime = times.reduce(
    (earliest, current) => (current < earliest ? current : earliest),
    times[0]
  );
  const latestTime = times.reduce(
    (latest, current) => (current > latest ? current : latest),
    times[0]
  );
  scheduleDetails.push([earliestTime, latestTime]);

  return scheduleDetails;
}

/**
 * Creates a color code for units based on index
 */
export function createColorCode(groups, colorCode = {}) {
  const palette = [
    "#FF0000",
    "#FF7F00",
    "#CFD302",
    "#085E4E",
    "#2189CA",
    "#4B0082",
    "#8B00FF",
    "#FF1493",
    "#211377",
    "#762117",
  ];

  groups.forEach((unit, index) => {
    const key = unit[0].classType + unit[0].description;
    colorCode[key] =
      palette[index] ||
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;
  });

  return colorCode;
}
