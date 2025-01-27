import {
    connect,
    ExtensionTransport,
  } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';
import {getSchedules, timeslotOverlap} from './scheduleUtil.js';

// Listens for messages from the popup or other parts of the extension
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
      await page.setViewport({ width: 1366, height: 768});

      // Scrape the page title as an example
      await page.waitForSelector('title');
      const pageTitle = await page.evaluate(() => document.title);
      console.log("Page Title:", pageTitle);


      await page.waitForSelector('.subject-list');
      const classesHref = await page.evaluate(() => {
        // gets the advanced filters subject list for semester 1 and 2
        const classElements = document.querySelectorAll('.subject-list');

        // gets all the available LTL and WRK 'li' elements for sem 1
        const liElements = classElements[0].querySelectorAll('.action');

        // returns href of each class
        return Array.from(liElements).map((li) => {
            const classHref = li.querySelector('a').getAttribute('href');
            return classHref;
        });
      });
      
      // scrape each timeslot from each available class
      const timeslotGroups = [];

      for(let i = 0; i < classesHref.length; i++){

        // go to each page of students classes
        await page.goto(url + classesHref[i]);

        // wait for the table to load
        await page.waitForSelector('.aplus-table');

        // get all tr elements
        const timeslotGroup = await page.evaluate(() =>{
            const timeslot = document.querySelector('.aplus-table tbody').querySelectorAll('tr');
            return Array.from(timeslot).map((el) =>{
                // need to check if table is changed when students are allowed prefereneces
                let j = 0
                if(el.querySelectorAll('td')[0].querySelector("select")){
                  j = 1;
                }
                // day 1
                const day = el.querySelectorAll('td')[1 + j].textContent;
                // time 2
                const time = el.querySelectorAll('td')[2 + j].textContent;
                // duration 5
                const duration = el.querySelectorAll('td')[5 + j].textContent;
                // description 7
                const description = el.querySelectorAll('td')[7 + j].textContent;
                // class type
                const classType = el.getAttribute('id').split('|')[1];
                return {
                    day,
                    time,
                    duration,
                    description,
                    classType
                };

            });
        });

        timeslotGroups.push(timeslotGroup);
      }
        
      const validSchedules = getSchedules(timeslotGroups);

      // create a new tab for visualiser html and send valid schedules to the page
      const visUrl = chrome.runtime.getURL("visualiser.html");
      const queryParams = new URLSearchParams({ data: JSON.stringify(validSchedules) });
      
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