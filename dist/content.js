chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "noUnitsFound") {
        alert("No units found for the selected semester. Please select another semester with units");
    }
    else if(message.action === "notLoggedIn"){
        alert("Please log into Allocate before using the extension, then try going into the extension and then pressing 'Visualize Schedule' again");
    }
});
