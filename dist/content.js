chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === "success"){

        // add bootstrap for spinner
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css';
        document.head.appendChild(link);

        // create container for loader overlay
        const overlayContainer = document.createElement("div");
        overlayContainer.className = "overlay-notif"
        const overlaySpan = document.createElement("span");
        overlaySpan.textContent = "Retrieving the timeslots from your units";

        // add spinner
        const spinner = document.createElement("div");
        spinner.className = "spinner-border overlay-spinner";
        overlaySpan.appendChild(spinner);

        //add to body of document
        overlayContainer.appendChild(overlaySpan);
        document.body.appendChild(overlayContainer);
    }
    else if(message.action === "fail"){
        alert("Error finding the timeslots on your Allocate page");
    }
});
