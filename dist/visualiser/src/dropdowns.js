// dropdowns.js
// Logic pertaining to the dropdowns used for manually adding your classes

import { getCellForTimeSlot } from "./scheduleRenderer.js";
import { store } from "./store.js";
import { qs } from "./uiHelpers.js";

export function loadUnitDropdowns() {
  // Generate dropdowns according to units

  store.timeslotGroups.forEach((unitGroup, index) => {
    const unitDropGroup = document.createElement("div");
    const unitDropdown = document.createElement("select");
    unitDropdown.className = "form-select";
    unitDropdown.id = `unitDropdown-${
      unitGroup[0].classType
    }-${unitGroup[0].description.replace(/\s+/g, "")}`;
    const unitDropdownLabel = document.createElement("label");
    unitDropGroup.style.borderLeft = `3px solid ${
      store.colorCode[`${unitGroup[0].classType}${unitGroup[0].description}`]
    }`;

    //create placeholder option
    const placeholderOption = document.createElement("option");
    placeholderOption.textContent = "Select a classtime";
    placeholderOption.setAttribute("disabled", true);
    placeholderOption.value = "";
    placeholderOption.setAttribute("selected", true);
    unitDropdown.appendChild(placeholderOption);

    //create options for each timeslot
    unitGroup.map((timeslot) => {
      const timeslotOption = document.createElement("option");
      timeslotOption.textContent =
        timeslot.day + " @ " + timeslot.time + " (" + timeslot.location + ")";
      timeslotOption.id = `${timeslot.day}-${timeslot.time}-${timeslot.location}`;
      timeslotOption.value = JSON.stringify(timeslot);
      unitDropdown.appendChild(timeslotOption);
    });

    unitDropdownLabel.textContent =
      unitGroup[0].classType + " " + unitGroup[0].description;
    unitDropdownLabel.setAttribute("for", unitDropdown.id);

    unitDropGroup.appendChild(unitDropdownLabel);
    unitDropGroup.appendChild(unitDropdown);
    unitDropGroup.className = "unit-drop-grp";
    qs(".manual-container").appendChild(unitDropGroup);

    // add event listener for each unit group

    unitDropdown.addEventListener("change", () => {
      const timeslotSelection = JSON.parse(unitDropdown.value);
      // clear existing timeslot from schedule view if present
      const existingTimeslot = document.getElementById(
        timeslotSelection.classType + "-" + timeslotSelection.description
      );
      if (existingTimeslot) {
        existingTimeslot.remove();
        //update dropdown for existing
      }

      // enable save button
      qs("#save-btn").removeAttribute("disabled");
      // add timeslot to schedule view
      getCellForTimeSlot(timeslotSelection);
    });
  });
}
