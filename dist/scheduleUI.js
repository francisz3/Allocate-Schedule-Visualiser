////////// Handles DOM manipulation and interactions //////////

// tracks on load modal
const initialModal = new bootstrap.Modal("#initial-modal");

window.addEventListener('DOMContentLoaded', () => {

    if (!localStorage.getItem("hasVisited")) {
        // Show the modal
        initialModal.show();

        // Mark that the user has visited
        localStorage.setItem("hasVisited", "true");
    }
    
});


// Sets schedule view default scroll position lower
document.addEventListener("DOMContentLoaded", () => {
    const scrollableDiv = document.querySelector(".tableWrapper");
    scrollableDiv.scrollTop = 320;  
});

// loads the dropdowns for units
function loadUnitDropdowns(){
    // Generate dropdowns according to units
    
    timeslotGroups.forEach((unitGroup, index) => {
        const unitDropGroup = document.createElement("div");
        const unitDropdown = document.createElement("select");
        unitDropdown.className = "form-select";
        unitDropdown.id = `unitDropdown-${unitGroup[0].classType}-${unitGroup[0].description.replace(/\s+/g, "")}`;
        const unitDropdownLabel = document.createElement("label");
        unitDropdownLabel.style.borderLeft = `3px solid ${colorCode[`${unitGroup[0].classType}${unitGroup[0].description}`]}`;

        

        //create placeholder option
        const placeholderOption = document.createElement("option");
        placeholderOption.textContent = "Select a classtime";
        placeholderOption.setAttribute("disabled", true);
        placeholderOption.value = "";
        placeholderOption.setAttribute("selected", true);
        unitDropdown.appendChild(placeholderOption);

        //create options for each timeslot
        unitGroup.map(timeslot => {
            const timeslotOption = document.createElement("option");
            timeslotOption.textContent = timeslot.day + " @ " + timeslot.time + " (" + timeslot.location + ")";
            timeslotOption.id = `${timeslot.day}-${timeslot.time}-${timeslot.location}`;
            timeslotOption.value = JSON.stringify(timeslot);
            unitDropdown.appendChild(timeslotOption);
        });
    
        unitDropdownLabel.textContent = unitGroup[0].classType + " " + unitGroup[0].description;
        unitDropdownLabel.setAttribute('for', unitDropdown.id);
        
        unitDropGroup.appendChild(unitDropdownLabel);
        unitDropGroup.appendChild(unitDropdown);
        unitDropGroup.className = "unit-drop-grp";
        manualContainer.appendChild(unitDropGroup);

        // add event listener for each unit group

        unitDropdown.addEventListener("change", () => {
            const timeslotSelection = JSON.parse(unitDropdown.value);
            // clear existing timeslot from schedule view if present
            const existingTimeslot = document.getElementById(timeslotSelection.classType + "-" + timeslotSelection.description);
            if(existingTimeslot){
                existingTimeslot.remove();
                //update dropdown for existing
            }
            
            // add timeslot to schedule view
            getCellForTimeSlot(timeslotSelection);

            
        });
        
    })
}

function populateTimeDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const startHour = 5; 
    const endHour = 23; 

    for (let hour = startHour; hour <= endHour; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      const option = document.createElement('option');
      option.value = `${formattedHour}:00`; 
      option.textContent = `${formattedHour}:00`;
      dropdown.appendChild(option);
    }
}
populateTimeDropdown('earliestDropdown');
populateTimeDropdown('latestDropdown');


// Select the tbody element
const tbody = document.querySelector(".sched-table tbody");

// Array of time slots
const timeSlots = [
    "00:00AM", "01:00AM", "02:00AM", "03:00AM", "04:00AM", "05:00AM", 
    "06:00AM", "07:00AM", "08:00AM", "09:00AM", "10:00AM", "11:00AM",
    "12:00PM", "13:00PM", "14:00PM", "15:00PM", "16:00PM", "17:00PM",
    "18:00PM", "19:00PM", "20:00PM", "21:00PM", "22:00PM", "23:00PM"
];

// Generate rows dynamically
timeSlots.forEach(time => {
    // Create a new row
    const row = document.createElement("tr");

    // Create the time cell
    const timeCell = document.createElement("td");
    timeCell.textContent = time;
    timeCell.style.paddingLeft = ".8rem";
    row.appendChild(timeCell);

    // Create cells for each day (Monday to Friday)
    for (let i = 0; i < 5; i++) {
        const cell = document.createElement("td");
        row.appendChild(cell);
    }

    // Append the row to the tbody
    tbody.appendChild(row);
});
