// uiSetup.js
import { qs } from "./uiHelpers.js";
import { createSchedBtns } from "./scheduleRenderer.js";
import { store } from "./store.js";

export function setupUIInteractions() {
  setupViewMoreBtn();
  setupFirstVisitModal();
  setupScreenshotExport();
  setupPopovers();
  setupTimeDropdowns();
  setupDarkmode();
}

function setupViewMoreBtn() {
  const btn = qs("#vm-btn");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    createSchedBtns(store.currentSchedules);
    btn.disabled = true;
    btn.style.display = "none";
  });
}

function setupFirstVisitModal() {
  if (!localStorage.getItem("hasVisited")) {
    const modal = new bootstrap.Modal("#initial-modal");
    modal.show();
    localStorage.setItem("hasVisited", "true");
  }
}

function setupScreenshotExport() {
  qs("#save-btn").addEventListener("click", (event) => {
    event.preventDefault();

    const wrapper = document.querySelector(".tableWrapper");
    wrapper.scrollTop = 0;

    const table = document.querySelector(".sched-table");
    setTimeout(() => {
      html2canvas(table).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "uni-schedule-asv";
        link.click();
      });
    }, 300);
  });
}

function setupPopovers() {
  const popoverTriggers = document.querySelectorAll(
    '[data-bs-toggle="popover"]'
  );
  [...popoverTriggers].forEach((el) => new bootstrap.Popover(el));
}

function populateTimeDropdown(dropdownElement, startHour = 5, endHour = 23) {
  for (let hour = startHour; hour <= endHour; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    const option = document.createElement("option");
    option.value = `${formattedHour}:00`;
    option.textContent = `${formattedHour}:00`;
    dropdownElement.appendChild(option);
  }
}

function setupTimeDropdowns() {
  const earliest = document.getElementById("earliestDropdown");
  const latest = document.getElementById("latestDropdown");
  if (earliest) populateTimeDropdown(earliest);
  if (latest) populateTimeDropdown(latest);
}

function setupDarkmode() {
  // check if dark mode was set already
  chrome.storage.local.get("darkMode", (result) => {
    if (result.darkMode) {
      document.body.classList.toggle("dark-mode");
      document.getElementById("darkModeSwitch").checked = true;
    }
  });

  // listener for dark mode change on switch
  document.getElementById("darkModeSwitch").addEventListener("change", (e) => {
    document.body.classList.toggle("dark-mode", e.target.checked);
    chrome.storage.local.set({ darkMode: e.target.checked });
  });
}
