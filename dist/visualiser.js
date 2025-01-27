// receives data from background js and inputs data in table
let validSchedules = null



document.addEventListener("DOMContentLoaded", () => {
    // Get data from query params
    const queryParams = new URLSearchParams(window.location.search);
    validSchedules = JSON.parse(queryParams.get("data"));
  
    const container = document.getElementById("data-container");

    const exampleSchedule = validSchedules[6];

    console.log(exampleSchedule);


    for(const timeslot of exampleSchedule){
        // get row and column that corresponds to timeslot
        getCellForTimeSlot(timeslot.time, timeslot.day, timeslot.duration, timeslot.description, timeslot.classType)

    }
});


function getCellForTimeSlot(time, day, duration, description, classType){
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
    cell.innerHTML = `<div class="timeslot">${classType} ${description} ${time}</div>`; 
    

    // check if timeslot is ends in :30 :60
    const timeslotDiv = cell.querySelector('.timeslot');
    const minutesPastHour = parseInt(time.substring(3,5))
    timeslotDiv.style.top = (( minutesPastHour/60 ) * 100) + "%";

    //multiply height of timeslot by duration
    
    timeslotDiv.style.height = 100 * parseInt(duration) + "%";

    // vertical align top to td
    // add div inside the td
    
}