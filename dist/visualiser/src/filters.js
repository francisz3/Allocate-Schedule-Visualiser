import { qs, qsa } from "./uiHelpers.js";
import { store } from "./store.js";
import { loadSchedules } from "./scheduleRenderer.js";

// Filter form submit handler

export function setupFilterListener() {
  qs("#filterForm").addEventListener("submit", (event) => {
    event.preventDefault();

    // clear all scheduleBtns
    qsa(".scheduleBtn").forEach((btn) => btn.remove());

    // find the days which they do not want to go uni
    const { unprefDays, prefNoDays, chosenETime, chosenLTime } =
      getFilterInputs();

    // check if preferred number of days is possible with schedules
    // if any days at uni are included in unpref days -> false
    const filteredSchedules = [];

    //flag to check if any time was able to fit within params
    let timeErrors = false;
    let noDaysErrors = false;
    let prefDayErrors = false;

    for (const schedule of store.validSchedules) {
      const daysAtUni = [...new Set(schedule.map((timeslot) => timeslot.day))];

      // check if time fits within desired times
      const times = schedule.map((timeslot) => timeslot.time);
      const earliestTime = times.reduce(
        (earliest, current) => (current < earliest ? current : earliest),
        times[0]
      );
      const latestTime = times.reduce(
        (latest, current) => (current > latest ? current : latest),
        times[0]
      );

      const fitsWithinChosen =
        chosenETime <= earliestTime && chosenLTime >= latestTime;

      if (fitsWithinChosen) {
        timeErrors = true;
      }

      if (daysAtUni.length == prefNoDays) {
        noDaysErrors = true;
      }

      if (!daysAtUni.some((day) => unprefDays.includes(day))) {
        prefDayErrors = true;
      }

      // !daysAtUni.some(day => unprefDays.includes(day)) if any days within the schedule are included in unwanted days -> false

      if (
        daysAtUni.length == prefNoDays &&
        !daysAtUni.some((day) => unprefDays.includes(day)) &&
        fitsWithinChosen
      ) {
        filteredSchedules.push(schedule);
        // switch check to true
      }
    }

    // keep track of schedules
    store.currentSchedules = filteredSchedules;

    handleParamErrors(
      timeErrors,
      noDaysErrors,
      prefDayErrors,
      filteredSchedules
    );
    loadSchedules(filteredSchedules);
  });
}

function getFilterInputs() {
  return {
    unprefDays: qsa('input[name="day-cb"]:not(:checked)').map((cb) => cb.value),
    prefNoDays: qs("#noDaysDropdown").value,
    chosenETime: qs("#earliestDropdown").value,
    chosenLTime: qs("#latestDropdown").value,
  };
}

/**
 * Errors for when users chosen filters aren't possible
 **/
function handleParamErrors(
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
      `Your chosen time constraints do not fit within your possible uni schedules`
    );
  }

  if (!noDaysErrors) {
    errorMessages.push(
      `Minimum days for your possible schedules are ${scheduleParam.minDaysAtUni} days`
    );
    errorMessages.push(
      `Max days for your possible schedules are ${scheduleParam.maxDaysAtUni} days`
    );
  }

  if (!prefDayErrors) {
    errorMessages.push(
      `Your schedule requires attendance on ${scheduleParam.mandatoryDays.join(
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
      `Your selected time range is too restrictive for the chosen number of days. Try increasing/changing your available days or extending the time range.`
    );
  }

  if (errorMessages.length > 0) {
    loadSchedules([]);

    errorContainer.innerHTML = errorMessages
      .map(
        (err) => `
      <div class="err-msg">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#bb5d5d" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"></path></svg>
       <p>${err}</p>
      </div>`
      )
      .join("");

    qs("#scheduleList").style.display = "none";
  } else {
    qs("#scheduleList").style.display = "block";
  }
}

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
