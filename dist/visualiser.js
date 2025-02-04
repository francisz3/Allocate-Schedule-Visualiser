// Initialise data variables
let validSchedules = null;
let timeslotGroups = null;
let currentSchedules = null;

const manualContainer = document.querySelector(".manual-container");

document.addEventListener("DOMContentLoaded", () => {
    // Get data from query params
    const queryParams = new URLSearchParams(window.location.search);
    validSchedules = JSON.parse(queryParams.get("data"));
    timeslotGroups = JSON.parse(queryParams.get("timeslots"));
    currentSchedules = validSchedules;

    // load initial sample schedules
    loadSchedules(validSchedules);

    // load dropdowns for manual edit
    loadUnitDropdowns();
});

// Filters schedules according to users desired days + no days + time at uni.
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

    for(const schedule of validSchedules){
        const daysAtUni = [... new Set(schedule.map(timeslot => timeslot.day))];

        // check if time fits within desired times
        const times = schedule.map(timeslot => timeslot.time);
        const earliestTime = times.reduce((earliest, current) => current < earliest ? current : earliest, times[0]);
        const latestTime = times.reduce((latest, current) => current > latest ? current : latest, times[0]);

        const fitsWithinChosen = chosenETime <= earliestTime && chosenLTime >= latestTime;

        // !daysAtUni.some(day => unprefDays.includes(day)) if any days within the schedule are included in unwanted days -> false

        if(daysAtUni.length == prefNoDays && !daysAtUni.some(day => unprefDays.includes(day)) && fitsWithinChosen){
            filteredSchedules.push(schedule);
        }
    }

    currentSchedules = filteredSchedules;
    loadSchedules(filteredSchedules);
});

const viewMoreBtn = document.getElementById("vm-btn");
viewMoreBtn.addEventListener("click", (event) => {
    // console.log(schedules.length);
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
    
    scheduleNotification.textContent = "Filtered Results:";

    // get a sample of given schedule
    const shortenedSched = schedules.slice(0,5);

    // create button to view more schedules if theres any more
    
    if(schedules.length > 5){
        
        viewMoreBtn.removeAttribute("disabled");
        viewMoreBtn.style.display = "block";

        // listener
        
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

    // clear dropdown if theres a 1-1 conflict
    const existingTimeslot = cell.querySelector("div");
    console.log(existingTimeslot);
    if(existingTimeslot){
        const conflictUnit = document.getElementById(`unitDropdown-${existingTimeslot.id.replace(/\s+/g, "")}`)
        console.log(existingTimeslot.id);
        conflictUnit.value = "";
    }

    //make sure change in timeslot changes the dropdown
    const reflectDropdown = document.getElementById(`unitDropdown-${classType}-${description.replace(/\s+/g, "")}`);
    const reflectOption = document.getElementById(`${day}-${time}-${location}`);
    reflectDropdown.value = reflectOption.value;

    
    
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