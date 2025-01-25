document.getElementById("scrape-button").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "scrape" });
  });
  