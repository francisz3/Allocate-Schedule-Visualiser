// popup.js
// functionality for popup:
// - button that opens up visualiser
// - adjusts semester selection depending on semesters student is enrolled in
import { getSchedules } from "../scheduleGenerator.js";

// check if current tab is allocate
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];

  if (currentTab && currentTab.url) {
    console.log("Current tab URL:", currentTab.url);

    // Example: check if it's the Allocate+ site
    if (currentTab.url.includes("https://mytimetable")) {
      // remove error if present
      document.getElementById("popup-error").style.display = "none";

      console.log("User is on Allocate+");
    } else {
      // remove container w/ buttons and select show the error
      document.getElementById("popup-container").style.display = "none";
      document.getElementById("popup-error").style.display = "block";

      console.warn("User is not on Allocate+. Prompt them to navigate.");
    }
  } else {
    console.error("Could not get the current tab.");
  }
});

// Sets up the semester selection based on the globally set allocateData
// - will check keys i.e. {"HE Sem01" : .... , "HE Sem02" : ... , "HE Flex"} , add these as option for user to select
// Sets up visualise schedule event listener
chrome.storage.local.get("allocateData", (result) => {
  const data = result.allocateData;

  if (!data) {
    console.log("Error retrieving data");
  }

  // adjust selection for semesters student is enrolled in
  const semesterSelect = document.getElementById("selectedSemester");
  for (const semester in data) {
    // if it's a flex semester add it to flex-semester-container

    if (semester.includes("Flex")) {
      // show flex sem container
      document.getElementById("flex-sem-container").style.display = "block";

      // create container div
      const checkContainer = document.createElement("div");

      // create checkbox input
      const flexInput = document.createElement("input");
      flexInput.type = "checkbox";
      flexInput.id = semester;
      flexInput.value = semester;

      // create label linked to checkbox by 'for' attribute
      const flexLabel = document.createElement("label");
      flexLabel.htmlFor = semester;
      flexLabel.textContent = semester;

      checkContainer.append(flexInput, flexLabel);
      document.getElementById("flex-cb-container").appendChild(checkContainer);
    } else {
      // otherwise just add it to semester select input
      const option = document.createElement("option");
      option.value = semester;
      option.textContent = semester;
      semesterSelect.appendChild(option);
    }
  }

  // set the timeslots and validSchedules based on the selected semester + open the visualiser page
  document.getElementById("vis-button").addEventListener("click", async () => {
    // get selected semester
    const selectedSemKey = semesterSelect.value;
    let selectedSem = data[selectedSemKey];

    // if there's any selected flex sems, add it to the selectedSem
    const flexCheckboxes = document.querySelectorAll(
      "#flex-cb-container input[type='checkbox']:checked"
    );

    // add flex sem data to selectedSem data
    flexCheckboxes.forEach((checkbox) => {
      const flexSemKey = checkbox.value;
      const flexSemTimeslots = data[flexSemKey];

      if (flexSemTimeslots && Array.isArray(flexSemTimeslots)) {
        selectedSem = selectedSem.concat(flexSemTimeslots);
      }
    });

    // set timeslots from selected sem
    chrome.storage.local.set({ allTimeslots: selectedSem });

    // generate and set valid schedules for timeslots
    const validSchedules = getSchedules(selectedSem);
    chrome.storage.local.set({ validSchedules });

    // open visualiser
    const visUrl = chrome.runtime.getURL("../../visualiser/visualiser.html");
    chrome.tabs.create({ url: visUrl });
  });
});

chrome.storage.local.get("darkMode", (result) => {
  if (result.darkMode) {
    document.body.classList.toggle("dark-mode", result.darkMode);
  }
});
