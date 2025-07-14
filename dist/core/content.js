// content.js
// Runs as soon as the user is on the allocate timetable page
// Goes through page source and finds the student data and sends it to background script to save globally

// get all script tags in the allocate page
const scriptTags = document.getElementsByTagName("script");
let targetData = null;

// go through each script tag and check if it has the student data object
for (let script of scriptTags) {
  // get text content of the script tag
  const scriptContent = script.textContent;

  // see if there's a section that corresponds to this format
  //  'data = { ... } '
  const dataMatch = scriptContent.match(/data\s*=\s*({.*?});/s);

  // check that a match was found
  // AND that the object inside the curly braces was captured
  if (dataMatch && dataMatch[1]) {
    // parse the data into JS object
    try {
      targetData = JSON.parse(dataMatch[1]);
      break;
    } catch (error) {
      console.error("Failed to parse Allocate data:", error);
    }
  }
}

// if succesfully retrieved targetData send the data to the background script to save globally
if (targetData) {
  chrome.runtime.sendMessage({
    type: "ALLOCATE_DATA_FOUND",
    data: targetData.student,
  });
} else {
  console.warn("No Allocate+ data object found.");
}
