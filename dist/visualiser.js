// Initialise data variables
let validSchedules = null;
let timeslotGroups = null;
let currentSchedules = null;
let colorCode = {};

const manualContainer = document.querySelector(".manual-container");

chrome.storage.local.get(["validSchedules", "allTimeslots"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving schedule data:", chrome.runtime.lastError);
    } else {
      validSchedules = result.validSchedules || [];
      timeslotGroups = result.allTimeslots || [];

      currentSchedules = validSchedules;

      // get a number of colors based on the length of timeslotGroups.length / number of units
      // ensure each of the colors are different and allow visibility for white text
      createColorCode(timeslotGroups);

      // load initial sample schedules
      loadSchedules(validSchedules);

      // load dropdowns for manual edit
      loadUnitDropdowns();
      // notification for sample schedules
      const scheduleNotification = document.getElementById("schedule-notification");

      scheduleNotification.textContent = "Here's some schedules to get started!";
    }
});

const filterForm = document.getElementById("filterForm");
filterForm.addEventListener('submit',function (event){
    event.preventDefault();

    // clear all scheduleBtns
    const scheduleBtns = document.querySelectorAll(".scheduleBtn");
    scheduleBtns.forEach(btn => btn.remove());

    // find the days which they do not want to go uni
    const unprefDays = []
    document.querySelectorAll('input[name = "day-cb"]:not(:checked)').forEach((checkbox)=>{
        unprefDays.push(checkbox.value);
    })

    // find number of days
    const prefNoDays = document.getElementById('noDaysDropdown').value;

    // find chosen earliest and latest time
    const chosenETime = document.getElementById('earliestDropdown').value;
    const chosenLTime = document.getElementById('latestDropdown').value;

    // check if preferred number of days is possible with schedules
    // if any days at uni are included in unpref days -> false
    const filteredSchedules = [];
    
    //flag to check if any time was able to fit within params
    let timeErrors = false;
    let noDaysErrors = false;
    let prefDayErrors = false;

    for(const schedule of validSchedules){
        const daysAtUni = [... new Set(schedule.map(timeslot => timeslot.day))];

        // check if time fits within desired times
        const times = schedule.map(timeslot => timeslot.time);
        const earliestTime = times.reduce((earliest, current) => current < earliest ? current : earliest, times[0]);
        const latestTime = times.reduce((latest, current) => current > latest ? current : latest, times[0]);

        const fitsWithinChosen = chosenETime <= earliestTime && chosenLTime >= latestTime;

        if(fitsWithinChosen){
            timeErrors = true;
        }

        if(daysAtUni.length == prefNoDays){
            noDaysErrors = true;
        }

        if(!daysAtUni.some(day => unprefDays.includes(day))){
            prefDayErrors = true;
        }

        // !daysAtUni.some(day => unprefDays.includes(day)) if any days within the schedule are included in unwanted days -> false

        if(daysAtUni.length == prefNoDays && !daysAtUni.some(day => unprefDays.includes(day)) && fitsWithinChosen){
            filteredSchedules.push(schedule);
            // switch check to true
        }
    }

    // keep track of schedules

    currentSchedules = filteredSchedules;

    handleParamErrors(timeErrors, noDaysErrors, prefDayErrors, filteredSchedules);
    loadSchedules(filteredSchedules);

});


function handleParamErrors(timeErrors, noDaysErrors, prefDayErrors, filteredSchedules){
    const scheduleParam = analyzeSchedules(validSchedules);
    // get error container from html
    const errorMessages = [];
    const errorContainer = document.getElementById("errorMessages");
    errorContainer.innerHTML = "";

    // if flag for timeErrors is still false -> push error
    if(!timeErrors){
        errorMessages.push(`- Your chosen time constraints do not fit within your possible uni schedules`);
    }

    if(!noDaysErrors){
        errorMessages.push(`- Minimum days for your possible schedules are ${scheduleParam.minDaysAtUni} days`)
    }

    if(!prefDayErrors){
        errorMessages.push(`- Your schedule requires attendance on ${scheduleParam.mandatoryDays.join(", ")}.`)
    }

    else if(filteredSchedules.length == 0 && timeErrors && noDaysErrors && prefDayErrors){
        errorMessages.push(`- Your selected time range is too restrictive for the chosen number of days. Try increasing/changing your available days.`)
    }

    if(errorMessages.length > 0){
        loadSchedules([]);
        errorContainer.innerHTML = errorMessages.map(err => `<p style="color: red;">${err}</p>`).join("");
    }
}

const viewMoreBtn = document.getElementById("vm-btn");
viewMoreBtn.addEventListener("click", (event) => {

    event.preventDefault();
    createSchedBtns(currentSchedules);

    // hide the button after loading all schedules
    viewMoreBtn.setAttribute("disabled", true);
    viewMoreBtn.style.display = "none";
    return;
});

// Loads schedules that user can select to show in their schedule view
function loadSchedules(schedules){
    // first check if theres any existing validSchedules
    const scheduleNotification = document.getElementById("schedule-notification");
    
    scheduleNotification.textContent = `Filtered Results: ${schedules.length} Results`;

    // get a sample of given schedule
    const shortenedSched = schedules.slice(0,5);

    // Load view more button if the possible schedule length is greater than 5
    if(schedules.length > 5){       
        viewMoreBtn.removeAttribute("disabled");
        viewMoreBtn.style.display = "block";        
    }
    else{
        viewMoreBtn.setAttribute("disabled", true);
        viewMoreBtn.style.display = "none";
    }

    // if theres no schedules return
    if(schedules.length == 0){
        scheduleNotification.textContent = "Sorry! There are no possible schedules that fit within your parameters.";
        return;
    }

    createSchedBtns(shortenedSched);
    
}


function createSchedBtns(schedules){
    const scheduleList = document.getElementById("scheduleList");
    

    for(const schedule of schedules){
        const scheduleBtn = document.createElement('button');

        // Days - earliest time, latest time
        const scheduleDetails = getScheduleDetails(schedule);

        // add day pill which includes the day and frequency of classes in each day
        const dayPillGrp = document.createElement("span");
        dayPillGrp.className = "day-pill-grp";
        Object.entries(scheduleDetails[0]).forEach(([key,value]) => {
            const dayPill = document.createElement("span");
            dayPill.className = "day-pill";
            dayPill.textContent = key + " " + value;
            dayPillGrp.appendChild(dayPill);
        });
        scheduleBtn.appendChild(dayPillGrp);
        // earliest/latest start time description
        const timeDescriptionGrp = document.createElement("span");
        timeDescriptionGrp.className = "time-description-group"
        const esDescription = document.createElement("p");
        const lsDescription = document.createElement("p");

        esDescription.textContent = "Earliest start time: " + scheduleDetails[1][0];
        lsDescription.textContent = "Latest start time: " + scheduleDetails[1][1];

        timeDescriptionGrp.appendChild(esDescription);
        timeDescriptionGrp.appendChild(lsDescription);
        scheduleBtn.appendChild(timeDescriptionGrp);

        scheduleBtn.className = "scheduleBtn"
        
        // add event listener for button to see if clicked
        // once clicked add schedule to schedule view
        scheduleBtn.addEventListener('click', (event) => {
            event.preventDefault();
            
            // clear the schedule view before adding schedule
            const currentSchedule = document.querySelectorAll(".timeslot");

            currentSchedule.forEach((timeslot) => timeslot.remove());  

            // enable the save btn
            enableSaveBtn();

            // put each timeslot of the schedule onto a corresponding cell
            schedule.forEach((timeslot) => {
                // get row and column that corresponds to timeslot
                getCellForTimeSlot(timeslot);
            });
            
        });

        scheduleList.appendChild(scheduleBtn)     
    }

}

// gets details of schedule to preview what days at uni the schedule will have and the earliest and latest time
function getScheduleDetails(schedule){
    const scheduleDetails = [];
    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    // Find which days the student has to be at uni

    // Count occurrences of each day
    const dayCounts = schedule.reduce((acc, item) => {
        acc[item.day] = (acc[item.day] || 0) + 1;
        return acc;
    }, {});

    // Sort the result based on the daysOrder
    const sortedDayCounts = Object.fromEntries(
        Object.entries(dayCounts).sort((a, b) => daysOrder.indexOf(a[0]) - daysOrder.indexOf(b[0]))
    );

    scheduleDetails.push(sortedDayCounts);

    // Find the earliest and latest time
    const times = schedule.map(timeslot => timeslot.time);

    const earliestTime = times.reduce((earliest, current) => current < earliest ? current : earliest, times[0]);
    const latestTime = times.reduce((latest, current) => current > latest ? current : latest, times[0]);
    scheduleDetails.push([earliestTime, latestTime]);

    return scheduleDetails;
}


// finds the corresponding cell (row and column) according to time and day of timeslot 
function getCellForTimeSlot(timeslot){
    // Day list
    const dayList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

    // Get index of day
    const dayIndex = dayList.indexOf(timeslot.day) + 1;

    // error handling if day is invalid
    if (dayIndex === -1) {
        console.log("Invalid day");
        return;
    }

    // get all rows
    const rows = document.querySelectorAll('.sched-table tbody tr');

    // find the row that corresponds to the time
    const timeIndex = parseInt(timeslot.time.substring(0,2));
    const cell = rows[timeIndex].querySelectorAll('td')[dayIndex];

    // clear dropdown if theres a 1-1 conflict
    const existingTimeslot = cell.querySelector("div");
    if(existingTimeslot){
        const conflictUnit = document.getElementById(`unitDropdown-${existingTimeslot.id.replace(/\s+/g, "")}`)
        conflictUnit.value = "";
    }

    //make sure change in timeslot changes the dropdown
    const reflectDropdown = document.getElementById(`unitDropdown-${timeslot.classType}-${timeslot.description.replace(/\s+/g, "")}`);
    const reflectOption = document.getElementById(`${timeslot.day}-${timeslot.time}-${timeslot.location}`);
    reflectDropdown.value = reflectOption.value;

    
    
    // after finding cell - add div (as timeslot) and corresponding details to it
    cell.innerHTML = `<div class="timeslot">${timeslot.classType} ${timeslot.description} ${timeslot.time} ${timeslot.location}</div>`; 
    

    // check if timeslot is ends in :30 :60
    const timeslotDiv = cell.querySelector('.timeslot');
    const minutesPastHour = parseInt(timeslot.time.substring(3,5))
    timeslotDiv.style.top = (( minutesPastHour/60 ) * 100) + "%";

    // make the backgroundColor the 
    timeslotDiv.style.backgroundColor = colorCode[`${timeslot.classType}${timeslot.description}`];

    //multiply height of timeslot by duration
    
    timeslotDiv.style.height = 100 * parseInt(timeslot.duration) + "%";
    timeslotDiv.id = timeslot.classType + "-" + timeslot.description;
    
}


function analyzeSchedules(validSchedules) {
    if (validSchedules.length === 0) {
        return;
    }

    // Extract all unique days from schedules
    const allDays = [...new Set(validSchedules.flatMap(schedule => schedule.map(timeslot => timeslot.day)))];

    // Find mandatory days (appear in ALL schedules)
    const mandatoryDays = allDays.filter(day =>
        validSchedules.every(schedule => schedule.some(timeslot => timeslot.day === day))
    );

    // Find the minimum number of days required in any schedule
    const minDaysAtUni = Math.min(...validSchedules.map(schedule =>
        new Set(schedule.map(timeslot => timeslot.day)).size
    ));

    return {
        mandatoryDays,
        minDaysAtUni,
    };
}

function createColorCode(timeslotGroups) {
    colorList = [
        "#FF0000", // Red
        "#FF7F00", // Orange
        "#CFD302", // Yellow
        "#085E4E", // Green
        "#2189CA", // Blue
        "#4B0082", // Indigo
        "#8B00FF", // Violet
        "#FF1493", // Deep Pink
        "#211377", // Deep Blue
        "#762117", // Deep Red
    ];
    
    timeslotGroups.forEach((unit,index) => {
        const colorId = unit[0].classType + unit[0].description;
        
        // if number of units are greater than the colorList due to overload or such, then just give random colors
        if(index >= colorList.length){
            colorCode[colorId] = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        }
        else{
            colorCode[colorId] = colorList[index];
        }
        
    });

}

// ["#272A4F","#355070","#6d597a","#5b8071","#e69d75","#e56b6f","#854852","#61303b"];
// ["#bf4949","#4b982d","#472073","#3977bd","#420826","#085e4e","#8c6820","#c53d9a"];