chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "noUnitsFound") {
        alert("No units found for the selected semester. Please select another semester with units");
    }
});
