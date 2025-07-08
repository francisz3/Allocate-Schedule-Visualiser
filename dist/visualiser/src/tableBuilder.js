// tableBuilder.js
export function buildScheduleTable(tbodySelector = ".sched-table tbody") {
  const timeSlots = [...Array(24).keys()].map(
    (h) => `${h.toString().padStart(2, "0")}:00${h < 12 ? "AM" : "PM"}`
  );
  const tbody = document.querySelector(tbodySelector);

  timeSlots.forEach((time) => {
    const row = document.createElement("tr");

    const timeCell = document.createElement("td");
    timeCell.textContent = time;
    timeCell.style.paddingLeft = ".8rem";
    row.appendChild(timeCell);

    for (let i = 0; i < 5; i++) {
      row.appendChild(document.createElement("td"));
    }

    tbody.appendChild(row);
  });

  const scrollableDiv = document.querySelector(".tableWrapper");
  if (scrollableDiv) scrollableDiv.scrollTop = 320;
}
