// scheduleRenderer.js
// Handles rendering schedules to the UI

import { qs, qsa } from "./uiHelpers.js";
import { store } from "./store.js";

/**
 * Displays a preview of the provided schedules and manages UI state.
 * - Updates the schedule notification text with result count.
 * - Shows or hides the "View More" button based on the number of results.
 * - Renders up to 5 schedule preview buttons (unless none are available).
 **/
export function loadSchedules(schedules) {
  // first check if theres any existing validSchedules
  const scheduleNotification = qs("#schedule-notification");

  scheduleNotification.textContent = `Filtered Results: ${schedules.length} Results`;

  // get a sample of given schedule
  const shortenedSched = schedules.slice(0, 5);

  // Load view more button if the possible schedule length is greater than 5
  const viewMoreBtn = qs("#vm-btn");
  if (schedules.length > 5) {
    viewMoreBtn.removeAttribute("disabled");
    viewMoreBtn.style.display = "block";
  } else {
    viewMoreBtn.setAttribute("disabled", true);
    viewMoreBtn.style.display = "none";
  }

  // if theres no schedules return
  if (schedules.length == 0) {
    scheduleNotification.textContent =
      "Sorry! There are no possible schedules that fit within your parameters.";
    return;
  }

  createSchedBtns(shortenedSched);
}

/**
 * Creates the actual schedule buttons that a user clicks to view a potential schedule
 */
export function createSchedBtns(schedules) {
  const scheduleList = document.getElementById("scheduleList");

  for (const schedule of schedules) {
    const scheduleBtn = document.createElement("button");

    // Days - earliest time, latest time
    const scheduleDetails = getScheduleDetails(schedule);

    // add day pill which includes the day and frequency of classes in each day
    const dayPillGrp = document.createElement("span");
    dayPillGrp.className = "day-pill-grp";
    Object.entries(scheduleDetails[0]).forEach(([key, value]) => {
      const dayPill = document.createElement("span");
      dayPill.className = "day-pill";
      dayPill.textContent = key + " " + value;
      dayPillGrp.appendChild(dayPill);
    });
    scheduleBtn.appendChild(dayPillGrp);
    // earliest/latest start time description
    const timeDescriptionGrp = document.createElement("span");
    timeDescriptionGrp.className = "time-description-group";
    const esDescription = document.createElement("p");
    const lsDescription = document.createElement("p");

    esDescription.textContent = "Earliest start time: " + scheduleDetails[1][0];
    lsDescription.textContent = "Latest start time: " + scheduleDetails[1][1];

    timeDescriptionGrp.appendChild(esDescription);
    timeDescriptionGrp.appendChild(lsDescription);
    scheduleBtn.appendChild(timeDescriptionGrp);

    scheduleBtn.className = "scheduleBtn";

    // add event listener for button to see if clicked
    // once clicked add schedule to schedule view
    scheduleBtn.addEventListener("click", (event) => {
      event.preventDefault();

      // clear the schedule view before adding schedule
      const currentSchedule = document.querySelectorAll(".timeslot");

      currentSchedule.forEach((timeslot) => timeslot.remove());

      // enable the save btn
      qs("#save-btn").removeAttribute("disabled");

      // put each timeslot of the schedule onto a corresponding cell
      schedule.forEach((timeslot) => {
        // get row and column that corresponds to timeslot
        getCellForTimeSlot(timeslot);
      });
    });

    scheduleList.appendChild(scheduleBtn);
  }
}

/**
 * Creates the details of each schedule i.e. number of occurences of a specific class in a week + earliest / latest start time
 */
function getScheduleDetails(schedule) {
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

export function getCellForTimeSlot(timeslot) {
  // Day list
  const dayList = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Get index of day
  const dayIndex = dayList.indexOf(timeslot.day) + 1;

  // error handling if day is invalid
  if (dayIndex === -1) {
    console.log("Invalid day");
    return;
  }

  // get all rows
  const rows = document.querySelectorAll(".sched-table tbody tr");

  // find the row that corresponds to the time
  const timeIndex = parseInt(timeslot.time.substring(0, 2));
  const cell = rows[timeIndex].querySelectorAll("td")[dayIndex];

  // clear dropdown if theres a 1-1 conflict
  const existingTimeslot = cell.querySelector("div");
  if (existingTimeslot) {
    qs(`unitDropdown-${existingTimeslot.id.replace(/\s+/g, "")}`).value = "";
  }

  //make sure change in timeslot changes the dropdown
  const reflectDropdown = document.getElementById(
    `unitDropdown-${timeslot.classType}-${timeslot.description.replace(
      /\s+/g,
      ""
    )}`
  );

  const reflectOption = document.getElementById(
    `${timeslot.day}-${timeslot.time}-${timeslot.location}`
  );

  reflectDropdown.value = reflectOption.value;

  // after finding cell - add div (as timeslot) and corresponding details to it
  cell.innerHTML = `<div class="timeslot">${timeslot.classType} ${timeslot.description} ${timeslot.time} ${timeslot.location}</div>`;

  // check if timeslot is ends in :30 :60
  const timeslotDiv = cell.querySelector(".timeslot");
  const minutesPastHour = parseInt(timeslot.time.substring(3, 5));
  timeslotDiv.style.top = (minutesPastHour / 60) * 100 + "%";

  // make the backgroundColor the
  timeslotDiv.style.backgroundColor =
    store.colorCode[`${timeslot.classType}${timeslot.description}`];

  //multiply height of timeslot by duration

  timeslotDiv.style.height = 100 * parseInt(timeslot.duration / 60) + "%";
  timeslotDiv.id = timeslot.classType + "-" + timeslot.description;
}
