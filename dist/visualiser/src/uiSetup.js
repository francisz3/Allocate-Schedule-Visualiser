// uiSetup.js
import { qs } from "./uiHelpers.js";
import { createSchedBtns } from "./scheduleRenderer.js";
import { store } from "./store.js";

export function setupUIInteractions() {
  setupViewMoreBtn();
  setupFirstVisitModal();
  setupScreenshotExport();
  setupPopovers();
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
  document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("hasVisited")) {
      const modal = new bootstrap.Modal("#initial-modal");
      modal.show();
      localStorage.setItem("hasVisited", "true");
    }
  });
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
