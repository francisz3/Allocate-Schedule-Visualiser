// receives data from background js and inputs data in table
let validSchedules = null



document.addEventListener("DOMContentLoaded", () => {
    // Get data from query params
    const queryParams = new URLSearchParams(window.location.search);
    validSchedules = JSON.parse(queryParams.get("data"));
  
    const container = document.getElementById("data-container");

    const exampleSchedule = validSchedules[2];

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
    // cell.style. = "flex";

    // vertical align top to td
    // add div inside the td

    // div should have text, time, location
    // css styling of 
    // background-color: blue;
    // width: 12px;
    // vertical-align: top;
    // height: 1px;
    // position: absolute;
    
}
  

// to find out how to do :30 :45
// 30/60 = 50 -> 50% height
//