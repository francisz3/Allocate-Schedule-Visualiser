document.getElementById("scrape-button").addEventListener("click", () => {
  // Send scrape request to the background script
  
  chrome.runtime.sendMessage(
    { action: "scrape", url: 'https://mytimetable.rmit.edu.au/odd/student' }
    ,
    (response) => {
      // if (response.response) {
      //   console.log("Scraping started...");
      // } else {
      //   console.error("Scraping failed:", response.error);
      // }
      alert("hello");
      if(response){
        chrome.tabs.create({
        url: "https://www.example.com"  // URL for the new tab
        });
      }
      
    }
  );
});
  

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "scrapeResult") {
    const data = message.data;

    // Open visualiser.html and pass the data
    const url = chrome.runtime.getURL("visualiser.html");
    const queryParams = new URLSearchParams({ data: JSON.stringify(data) });
    window.open(`${url}?${queryParams.toString()}`, "_blank");
  }
});