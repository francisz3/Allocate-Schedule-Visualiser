function formatTimeslots(activityTimeslots) {
  // formats/cleans the timeslots w/ only necessary fields e.g. day, time, location etc.

  const formattedTimeslots = [];
  for (const timeslot in activityTimeslots) {
    const timeslotData = activityTimeslots[timeslot];
    formattedTimeslots.push({
      day: timeslotData.day_of_week,
      time: timeslotData.start_time,
      location: timeslotData.location,
      duration: timeslotData.duration,
      description: timeslotData.description,
      classType: timeslotData.activity_group_code,
    });
  }

  return formattedTimeslots;
}

function organiseStudentData(studentData) {
  // organises the classes into their corresponding semesters

  const organisedData = {};
  // find all semesters that selected courses are in

  for (const activity in studentData) {
    // check which semester this activity is in
    const activityData = studentData[activity];
    const semesterOfActivity = activityData.semester_description;

    // get timeslots of the activity
    const activityTimeslots = activityData.all_activities;

    // format each of the timeslots with necessary fields
    const formattedTimeslots = formatTimeslots(activityTimeslots);

    // push the formatted timeslots to the array that corresponds to the activity's semester

    // If this semester doesn't exist in the object yet, create an empty array
    if (!organisedData[semesterOfActivity]) {
      organisedData[semesterOfActivity] = [];
    }

    // Add all formatted timeslots to the right semester
    organisedData[semesterOfActivity].push(formattedTimeslots);
  }

  return organisedData;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ALLOCATE_DATA_FOUND") {
    console.log("Student allocate data found", message.data);

    // format the data and separate them into their semesters
    const organisedData = organiseStudentData(message.data);
    // store to later access it
    chrome.storage.local.set({ allocateData: organisedData });
  }
});
