document.getElementById("scrape-button").addEventListener("click", () => {
  const selectedSemester = document.getElementById("selectedSemester");
  const selectedUni = document.getElementById("selectedUniversity").value;
  const uniUrl = selectedUni === "rmit" ? 'https://mytimetable.rmit.edu.au/odd/student' : 'https://selectclasses.acu.edu.au/odd/student'
    chrome.runtime.sendMessage({ action: "scrape", url: uniUrl , semester: selectedSemester.value });
});
  
// "https://my-timetable.monash.edu.au/odd/student"
// https://mytimetable.rmit.edu.au/odd/student'
// `https://mytimetable.${selectedUni}.edu.au/odd/student`