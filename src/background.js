import {
    connect,
    ExtensionTransport,
  } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';
import {getSchedules, timeslotOverlap} from './scheduleUtil.js';

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "scrape") {
    try {
      
      // create a new tab for allocate scrape
      const url = message.url;
      const tab = await chrome.tabs.create({ url: url });

      // connect Puppeteer to the tab
      const browser = await connect({
        transport: await ExtensionTransport.connectTab(tab.id),
      });

      // Get the page object and set the max height
      const [page] = await browser.pages();
      
      const { width, height } = await page.evaluate(() => {
        return { width: window.screen.availWidth, height: window.screen.availHeight };
      });
    
      await page.setViewport({ width, height });
   

      // Scrape the page title as an example
      await page.waitForSelector('title');
      const pageTitle = await page.evaluate(() => document.title);
      console.log("Page Title:", pageTitle);

      await page.waitForSelector('.subject-list');
      
      const semester = parseInt(message.semester);

      const classesHref = await page.evaluate((semester) => {
        // gets the advanced filters subject list for semester 1 and 2
        const classElements = document.querySelectorAll('.subject-list');

        // check if theres any units for the desired semester
        if (!classElements[semester]) {
          return null; // No subjects available
        }
  
        // gets all the available LTL and WRK 'li' elements for sem 1
        const liElements = classElements[semester].querySelectorAll('.action');

        // return if there are no classes
        if (!liElements.length) {
          return null;
      }

        // returns href of each class
        return Array.from(liElements).map((li) => {
            const classHref = li.querySelector('a').getAttribute('href');
            return classHref;
        });
      }, semester);
      
      if (!classesHref) {
        chrome.runtime.sendMessage({
            action: "noUnitsFound",
            semester: message.semester
        });
        chrome.tabs.sendMessage(tab.id, { action: "noUnitsFound" });
        browser.disconnect();
        return;
      }
      
      // scrape each timeslot from each available class
      const timeslotGroups = [];

      for(let i = 0; i < classesHref.length; i++){

        // go to each page of students classes
        await page.goto(url + classesHref[i]);

        // wait for the table to load
        await page.waitForSelector('.aplus-table');

        // get index of th elements
        
        // get all tr elements
        const timeslotGroup = await page.evaluate(() =>{
            // get all th elements to see where each column is
            const thElements = document.querySelectorAll('.aplus-table thead tr th');
            
            // convert it all to the text content to get the indices
            const thTexts = Array.from(thElements).map(th => th.textContent.trim());

            const timeslot = document.querySelector('.aplus-table tbody').querySelectorAll('tr');
            return Array.from(timeslot).map((el) =>{
                // need to check if table is changed when students are allowed prefereneces

                // day 1
                const day = el.querySelectorAll('td')[thTexts.indexOf("Day")].textContent;
                // time 2
                const time = el.querySelectorAll('td')[thTexts.indexOf("Time")].textContent;
                // location 4
                const location = el.querySelectorAll('td')[thTexts.indexOf("Location")].textContent === "-" ? "Canvas" : el.querySelectorAll('td')[thTexts.indexOf("Location")].textContent;
                // duration 5
                const duration = el.querySelectorAll('td')[thTexts.indexOf("Duration")].textContent;
                // description 7
                const description = el.querySelectorAll('td')[thTexts.indexOf("Description")].textContent;
                // class type
                const classType = el.getAttribute('id').split('|')[1];
                return {
                    day,
                    time,
                    location,
                    duration,
                    description,
                    classType
                };

            });
        });

        timeslotGroups.push(timeslotGroup);
      }
      
      const allTimeslots = [...timeslotGroups];
      const validSchedules = getSchedules(timeslotGroups);

      // create a new tab for visualiser html and send valid schedules to the page
      const visUrl = chrome.runtime.getURL("visualiser.html");
      const queryParams = new URLSearchParams({ data: JSON.stringify(validSchedules), timeslots: JSON.stringify(allTimeslots) });
      
      chrome.tabs.create({
        url: `${visUrl}?${queryParams.toString()}`
      });

      sendResponse({ success: true, action: "scrapeResult", data: timeslotGroups });
      browser.disconnect();
    } catch (error) {
      console.error("Error during Puppeteer operation:", error);
      sendResponse({ success: false, error: error.message });
      
    }
  }
  return true; // Keeps the message channel open for asynchronous responses
});