// Get the data
let validSchedules = null;
let timeslotGroups = null;
const manualContainer = document.querySelector(".manual-container");

document.addEventListener("DOMContentLoaded", () => {
    // Get data from query params
    const queryParams = new URLSearchParams(window.location.search);
    validSchedules = JSON.parse(queryParams.get("data"));
    timeslotGroups = JSON.parse(queryParams.get("timeslots"));
    console.log(timeslotGroups.length);
    // load sample schedules
    loadSchedules(validSchedules);

    // load dropdowns for manual edit
    loadUnitDropdowns();
});

// Filters schedules according to users desired days + no days + time at uni.
// Get filter form
const filterForm = document.getElementById("filterForm");
filterForm.addEventListener('submit',function (event){
    event.preventDefault();

    // clear all scheduleBtns
    const scheduleBtns = document.querySelectorAll(".scheduleBtn");
    scheduleBtns.forEach(btn => btn.remove());

    // find the preferred days user selected
    const selectedDays = []
    document.querySelectorAll('input[name = "day-cb"]:checked').forEach((checkbox)=>{
        selectedDays.push(checkbox.value);
    })

    // find number of days
    const prefNoDays = document.getElementById('noDaysDropdown').value;

    // find chosen earliest and latest time
    const chosenETime = document.getElementById('earliestDropdown').value;
    const chosenLTime = document.getElementById('latestDropdown').value;


    // check if preferred number of days is possible with schedules
    const filteredSchedules = [];

    for(const schedule of validSchedules){
        const daysAtUni = [... new Set(schedule.map(timeslot => timeslot.day))];

        // check if time fits within desired times
        const times = schedule.map(timeslot => timeslot.time);
        const earliestTime = times.reduce((earliest, current) => current < earliest ? current : earliest, times[0]);
        const latestTime = times.reduce((latest, current) => current > latest ? current : latest, times[0]);

        const fitsWithinChosen = chosenETime <= earliestTime && chosenLTime >= latestTime;

        if(daysAtUni.length == prefNoDays && daysAtUni.some(day => selectedDays.includes(day)) && fitsWithinChosen){
            filteredSchedules.push(schedule);
        }
    }

    loadSchedules(filteredSchedules);

    // if filteredSchedules length == 0 - then theres no schedules available for chosen filters
    // prompt user

});


// Loads schedules that user can select to show in their schedule view
function loadSchedules(validSchedules){
    // first check if theres any existing validSchedules
    const scheduleNotification = document.getElementById("schedule-notification");
    if(validSchedules.length == 0){
        scheduleNotification.textContent = "Sorry! There are no possible schedules that fit within your parameters";
        return;
    }

    scheduleNotification.textContent = "Recommended Schedules";


    // get the schedule list
    const scheduleList = document.getElementById("scheduleList");
    const shortenedSched = validSchedules.slice(0,5);
    for(const schedule of shortenedSched){
        const scheduleBtn = document.createElement('button');
        // scheduleBtn.value = schedule;

        // Days - earliest time, latest time
        const scheduleDetails = getScheduleDetails(schedule);
        scheduleBtn.textContent = scheduleDetails[0] + " Earliest Time: " + scheduleDetails[1][0] + " Latest Time: " + scheduleDetails[1][1]
        scheduleBtn.className = "scheduleBtn"
        
        // add event listener for button to see if clicked
        // once clicked add schedule to schedule view
        scheduleBtn.addEventListener('click', (event) => {
            event.preventDefault();
            
            // clear the schedule view before adding schedule
            const currentSchedule = document.querySelectorAll(".timeslot");

            currentSchedule.forEach((timeslot) => timeslot.remove());

            // put each timeslot of the schedule onto a corresponding cell
            for(const timeslot of schedule){
                // get row and column that corresponds to timeslot
                getCellForTimeSlot(timeslot.time, timeslot.day, timeslot.duration, timeslot.description, timeslot.classType, timeslot.location)
            }
        });

        scheduleList.appendChild(scheduleBtn)
        
    }
}

// gets details of schedule to preview what days at uni the schedule will have and the earliest and latest time
function getScheduleDetails(schedule){
    const scheduleDetails = [];

    // Find which days the student has to be at uni
    const daysAtUni = [... new Set(schedule.map(timeslot => timeslot.day))];
    scheduleDetails.push(daysAtUni);

    // Find the earliest and latest time
    const times = schedule.map(timeslot => timeslot.time);

    const earliestTime = times.reduce((earliest, current) => current < earliest ? current : earliest, times[0]);
    const latestTime = times.reduce((latest, current) => current > latest ? current : latest, times[0]);
    scheduleDetails.push([earliestTime, latestTime]);
    
    return scheduleDetails;
}

  





// finds the corresponding cell (row and column) according to time and day of timeslot 
function getCellForTimeSlot(time, day, duration, description, classType, location){
    // Day list
    const dayList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

    // Get index of day
    const dayIndex = dayList.indexOf(day) + 1;

    // error handling if day is invalid
    if (dayIndex === -1) {
        console.log("Invalid day");
        return;
    }

    // get all rows
    const rows = document.querySelectorAll('.sched-table tbody tr');

    // find the row that corresponds to the time
    const timeIndex = parseInt(time.substring(0,2));
    const cell = rows[timeIndex].querySelectorAll('td')[dayIndex];

    // after finding cell - add div (as timeslot) and corresponding details to it
    cell.innerHTML = `<div class="timeslot">${classType} ${description} ${time} ${location}</div>`; 
    

    // check if timeslot is ends in :30 :60
    const timeslotDiv = cell.querySelector('.timeslot');
    const minutesPastHour = parseInt(time.substring(3,5))
    timeslotDiv.style.top = (( minutesPastHour/60 ) * 100) + "%";

    //multiply height of timeslot by duration
    
    timeslotDiv.style.height = 100 * parseInt(duration) + "%";
    timeslotDiv.id = classType + "-" + description;
    
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
    row.appendChild(timeCell);

    // Create cells for each day (Monday to Friday)
    for (let i = 0; i < 5; i++) {
        const cell = document.createElement("td");
        row.appendChild(cell);
    }

    // Append the row to the tbody
    tbody.appendChild(row);
});


function loadUnitDropdowns(){
    // Generate dropdowns according to units
    timeslotGroups.forEach((unitGroup, index) => {
    
        const unitDropdown = document.createElement("select");
        unitDropdown.id = `unitDropdown-${index}`;
        const unitDropdownLabel = document.createElement("label");
    
        unitGroup.map(timeslot => {
            const timeslotOption = document.createElement("option");
            timeslotOption.textContent = timeslot.day + " @ " + timeslot.time + " (" + timeslot.location + ")";
            timeslotOption.value = JSON.stringify(timeslot);
            unitDropdown.appendChild(timeslotOption);
        });
    
        unitDropdownLabel.textContent = unitGroup[0].classType + " " + unitGroup[0].description;
        unitDropdownLabel.setAttribute('for', unitDropdown.id);
        
        manualContainer.appendChild(unitDropdownLabel);
        manualContainer.appendChild(unitDropdown);

        // add event listener for each unit group

        unitDropdown.addEventListener("change", function(){
            const timeslotSelection = JSON.parse(unitDropdown.value);

            // clear existing timeslot from schedule view if present
            const existingTimeslot = document.getElementById(timeslotSelection.classType + "-" + timeslotSelection.description);
            if(existingTimeslot){
                existingTimeslot.remove();
            }
            
            // add timeslot to schedule view
            getCellForTimeSlot(timeslotSelection.time, timeslotSelection.day, timeslotSelection.duration, timeslotSelection.description, timeslotSelection.classType, timeslotSelection.location );

            
        });
        
    })
}

// Sets schedule view default scroll position lower
document.addEventListener("DOMContentLoaded", () => {
    const scrollableDiv = document.querySelector(".tableWrapper");
    scrollableDiv.scrollTop = 325;  
});