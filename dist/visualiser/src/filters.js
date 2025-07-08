import { qs, qsa } from "./uiHelpers.js";
import { handleParamErrors } from "./utils.js";

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
