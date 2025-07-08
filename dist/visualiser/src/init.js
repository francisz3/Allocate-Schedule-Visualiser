// init.js
// Entry point that loads data, attaches event listeners, and kicks off the app
import { qs } from "./uiHelpers.js";
import { createColorCode } from "./utils.js";
import { store } from "./store.js";
import { loadSchedules } from "./scheduleRenderer.js";
import { buildScheduleTable } from "./tableBuilder.js";
import { loadUnitDropdowns } from "./dropdowns.js";
import { setupUIInteractions } from "./uiSetup.js";
import { setupFilterListener } from "./filters.js";

// Load data from Chrome storage on startup
chrome.storage.local.get(["validSchedules", "allTimeslots"], (result) => {
  if (chrome.runtime.lastError) {
    console.error("Error retrieving schedule data:", chrome.runtime.lastError);
  } else {
    // store all data, so it can be accessed globally
    store.validSchedules = result.validSchedules || [];
    store.timeslotGroups = result.allTimeslots || [];
    store.currentSchedules = store.validSchedules;

    // Creates a color code for units based on number of classes
    store.colorCode = createColorCode(store.timeslotGroups);

    // load initial sample schedules
    loadSchedules(store.validSchedules);

    // build the schedule table
    buildScheduleTable();

    // load dropdowns for manual edit
    loadUnitDropdowns();

    // setup filter
    setupFilterListener();

    // setup UI
    setupUIInteractions();

    // notification for sample schedules
    qs("#schedule-notification").textContent =
      "Here's some schedules to get started!";
  }
});
