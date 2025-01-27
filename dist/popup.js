document.getElementById("scrape-button").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "scrape", url: 'https://mytimetable.rmit.edu.au/odd/student' });
  });
  