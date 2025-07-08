// utils.js
// Misc util functions shared across app
import { store } from "./store.js";
import { loadSchedules } from "./scheduleRenderer.js";

/**
 * Analyzes valid schedules to extract useful info e.g. max days at uni, mandatory days at uni
 **/
export function analyseSchedules() {
  if (store.validSchedules.length === 0) {
    return;
  }

  // Extract all unique days from schedules
  const allDays = [
    ...new Set(
      store.validSchedules.flatMap((schedule) =>
        schedule.map((timeslot) => timeslot.day)
      )
    ),
  ];

  // Find mandatory days (appear in ALL schedules)
  const mandatoryDays = allDays.filter((day) =>
    store.validSchedules.every((schedule) =>
      schedule.some((timeslot) => timeslot.day === day)
    )
  );

  // Find the minimum number of days required in any schedule
  const minDaysAtUni = Math.min(
    ...store.validSchedules.map(
      (schedule) => new Set(schedule.map((timeslot) => timeslot.day)).size
    )
  );

  const maxDaysAtUni = Math.max(
    ...store.validSchedules.map(
      (schedule) => new Set(schedule.map((timeslot) => timeslot.day)).size
    )
  );

  return {
    mandatoryDays,
    minDaysAtUni,
    maxDaysAtUni,
  };
}

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

/**
 * Errors for when users chosen filters aren't possible
 **/
export function handleParamErrors(
  timeErrors,
  noDaysErrors,
  prefDayErrors,
  filteredSchedules
) {
  const scheduleParam = analyseSchedules(store.validSchedules);
  // get error container from html
  const errorMessages = [];
  const errorContainer = document.getElementById("errorMessages");
  errorContainer.innerHTML = "";

  // if flag for timeErrors is still false -> push error
  if (!timeErrors) {
    errorMessages.push(
      `- Your chosen time constraints do not fit within your possible uni schedules`
    );
  }

  if (!noDaysErrors) {
    errorMessages.push(
      `- Minimum days for your possible schedules are ${scheduleParam.minDaysAtUni} days`
    );
    errorMessages.push(
      `- Max days for your possible schedules are ${scheduleParam.maxDaysAtUni} days`
    );
  }

  if (!prefDayErrors) {
    errorMessages.push(
      `- Your schedule requires attendance on ${scheduleParam.mandatoryDays.join(
        ", "
      )}.`
    );
  } else if (
    filteredSchedules.length == 0 &&
    timeErrors &&
    noDaysErrors &&
    prefDayErrors
  ) {
    errorMessages.push(
      `- Your selected time range is too restrictive for the chosen number of days. Try increasing/changing your available days or extending the time range.`
    );
  }

  if (errorMessages.length > 0) {
    loadSchedules([]);
    errorContainer.innerHTML = errorMessages
      .map((err) => `<p style="color: red;">${err}</p>`)
      .join("");
  }
}
