// receives data from background js and inputs data in table
let validSchedules = null

document.addEventListener("DOMContentLoaded", () => {
    // Get data from query params
    const queryParams = new URLSearchParams(window.location.search);
    validSchedules = JSON.parse(queryParams.get("data"));
  
    const container = document.getElementById("data-container");
  
    console.log(validSchedules);
});
  