let user = null;

let tasks = [];
let assignments = [];
let exams = [];


// CURRENT MONTH BEING SHOWN

let currentCalendarDate =
  new Date();


// ==========================
// ELEMENTS
// ==========================

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const calendarGrid =
  document.getElementById(
    "calendarGrid"
  );


const monthTitle =
  document.getElementById(
    "monthTitle"
  );


const previousMonthButton =
  document.getElementById(
    "previousMonth"
  );


const todayButton =
  document.getElementById(
    "todayButton"
  );


const nextMonthButton =
  document.getElementById(
    "nextMonth"
  );


// MOBILE NAVIGATION

const sidebar =
  document.getElementById(
    "sidebar"
  );


const openSidebarButton =
  document.getElementById(
    "openSidebar"
  );


const closeSidebarButton =
  document.getElementById(
    "closeSidebar"
  );


const sidebarOverlay =
  document.getElementById(
    "sidebarOverlay"
  );


// ==========================
// MOBILE MENU
// ==========================

function openMobileSidebar() {

  sidebar.classList.add(
    "mobile-open"
  );


  sidebarOverlay.classList.add(
    "show"
  );


  document.body.style.overflow =
    "hidden";
}


function closeMobileSidebar() {

  sidebar.classList.remove(
    "mobile-open"
  );


  sidebarOverlay.classList.remove(
    "show"
  );


  document.body.style.overflow =
    "";
}


openSidebarButton.addEventListener(
  "click",
  openMobileSidebar
);


closeSidebarButton.addEventListener(
  "click",
  closeMobileSidebar
);


sidebarOverlay.addEventListener(
  "click",
  closeMobileSidebar
);


document
  .querySelectorAll(
    ".nav-item"
  )
  .forEach(
    link => {

      link.addEventListener(
        "click",
        closeMobileSidebar
      );
    }
  );


document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Escape"
    ) {

      closeMobileSidebar();
    }
  }
);


window.addEventListener(
  "resize",
  function () {

    if (
      window.innerWidth >
      1000
    ) {

      closeMobileSidebar();
    }
  }
);


// ==========================
// START
// ==========================

async function startCalendar() {

  const loggedIn =
    await loadSession();


  if (!loggedIn) {
    return;
  }


  await loadCalendarData();


  renderCalendar();
}


// ==========================
// SESSION
// ==========================

async function loadSession() {

  try {

    const response =
      await fetch(
        "/api/session"
      );


    if (!response.ok) {

      window.location.href =
        "/login.html";


      return false;
    }


    const data =
      await response.json();


    user =
      data.user;


    return true;

  } catch (error) {

    console.error(
      "Session error:",
      error
    );


    window.location.href =
      "/login.html";


    return false;
  }
}


// ==========================
// LOGOUT
// ==========================

logoutButton.addEventListener(
  "click",
  async function () {

    try {

      await fetch(
        "/api/logout",
        {
          method:
            "POST"
        }
      );

    } catch (error) {

      console.error(error);
    }


    window.location.href =
      "/login.html";
  }
);


// ==========================
// LOAD DATA
// ==========================

async function loadCalendarData() {

  try {

    const [
      taskResponse,
      assignmentResponse,
      examResponse
    ] =
      await Promise.all([

        fetch(
          `/api/tasks/${user.id}`
        ),

        fetch(
          `/api/assignments/${user.id}`
        ),

        fetch(
          `/api/exams/${user.id}`
        )

      ]);


    if (
      taskResponse.status === 401 ||
      assignmentResponse.status === 401 ||
      examResponse.status === 401
    ) {

      window.location.href =
        "/login.html";


      return;
    }


    if (
      !taskResponse.ok ||
      !assignmentResponse.ok ||
      !examResponse.ok
    ) {

      throw new Error(
        "Could not load calendar data."
      );
    }


    tasks =
      await taskResponse.json();


    assignments =
      await assignmentResponse.json();


    exams =
      await examResponse.json();

  } catch (error) {

    console.error(
      "Calendar data error:",
      error
    );
  }
}


// ==========================
// CONTROLS
// ==========================

previousMonthButton.addEventListener(
  "click",
  function () {

    currentCalendarDate =
      new Date(

        currentCalendarDate
          .getFullYear(),

        currentCalendarDate
          .getMonth() - 1,

        1

      );


    renderCalendar();
  }
);


nextMonthButton.addEventListener(
  "click",
  function () {

    currentCalendarDate =
      new Date(

        currentCalendarDate
          .getFullYear(),

        currentCalendarDate
          .getMonth() + 1,

        1

      );


    renderCalendar();
  }
);


todayButton.addEventListener(
  "click",
  function () {

    currentCalendarDate =
      new Date();


    renderCalendar();
  }
);


// ==========================
// RENDER CALENDAR
// ==========================

function renderCalendar() {

  const year =
    currentCalendarDate
      .getFullYear();


  const month =
    currentCalendarDate
      .getMonth();


  monthTitle.textContent =
    new Date(
      year,
      month,
      1
    )
      .toLocaleDateString(
        undefined,
        {
          month:
            "long",

          year:
            "numeric"
        }
      );


  calendarGrid.innerHTML =
    "";


  // FIRST DAY OF MONTH

  const firstDay =
    new Date(
      year,
      month,
      1
    );


  // SUNDAY = 0

  const startingWeekday =
    firstDay.getDay();


  // START DATE FOR 42-CELL GRID

  const gridStartDate =
    new Date(
      year,
      month,
      1 - startingWeekday
    );


  // ALWAYS 42 CELLS

  for (
    let index = 0;
    index < 42;
    index++
  ) {

    const cellDate =
      new Date(

        gridStartDate
          .getFullYear(),

        gridStartDate
          .getMonth(),

        gridStartDate
          .getDate() + index

      );


    const dayElement =
      createCalendarDay(
        cellDate,
        month
      );


    calendarGrid.appendChild(
      dayElement
    );
  }
}


// ==========================
// CREATE DAY
// ==========================

function createCalendarDay(
  date,
  currentMonth
) {

  const day =
    document.createElement(
      "div"
    );


  day.className =
    "calendar-day";


  if (
    date.getMonth() !==
    currentMonth
  ) {

    day.classList.add(
      "other-month"
    );
  }


  if (
    isSameDate(
      date,
      getTodayDate()
    )
  ) {

    day.classList.add(
      "today"
    );
  }


  const dateString =
    formatDateKey(
      date
    );


  const events =
    getEventsForDate(
      dateString
    );


  day.innerHTML = `

    <div class="day-number">
      ${date.getDate()}
    </div>

    <div class="day-events">

      ${
        events
          .map(
            event =>
              createEventHTML(
                event
              )
          )
          .join("")
      }

    </div>

  `;


  return day;
}


// ==========================
// EVENTS FOR A DATE
// ==========================

function getEventsForDate(
  dateString
) {

  const events =
    [];


  // TASKS

  tasks.forEach(
    task => {

      const taskDate =
        normalizeDateString(
          task.due_date
        );


      if (
        taskDate ===
        dateString
      ) {

        const overdue =
          isOverdue(

            task.due_date,

            task.status
          );


        events.push({

          type:
            "task",

          title:
            task.title,

          overdue

        });
      }
    }
  );


  // ASSIGNMENTS

  assignments.forEach(
    assignment => {

      const assignmentDate =
        normalizeDateString(
          assignment.due_date
        );


      if (
        assignmentDate ===
        dateString
      ) {

        const overdue =
          isOverdue(

            assignment.due_date,

            assignment.status
          );


        events.push({

          type:
            "assignment",

          title:
            assignment.title,

          subject:
            assignment.subject,

          overdue

        });
      }
    }
  );


  // EXAMS

  exams.forEach(
    exam => {

      const examDate =
        normalizeDateString(
          exam.exam_date
        );


      if (
        examDate ===
        dateString
      ) {

        events.push({

          type:
            "exam",

          title:
            exam.title,

          subject:
            exam.subject,

          overdue:
            false

        });
      }
    }
  );


  return events;
}


// ==========================
// EVENT HTML
// ==========================

function createEventHTML(
  event
) {

  let className =
    "";


  let icon =
    "";


  let label =
    event.title;


  if (
    event.overdue
  ) {

    className =
      "overdue-event";

    icon =
      "🚨";
  }


  else if (
    event.type ===
    "task"
  ) {

    className =
      "task-event";

    icon =
      "📝";
  }


  else if (
    event.type ===
    "assignment"
  ) {

    className =
      "assignment-event";

    icon =
      "📚";
  }


  else if (
    event.type ===
    "exam"
  ) {

    className =
      "exam-event";

    icon =
      "📅";
  }


  if (
    event.subject
  ) {

    label =
      event.subject +
      ": " +
      event.title;
  }


  return `

    <div
      class="calendar-event ${className}"
      title="${escapeHTML(label)}"
    >

      ${icon}
      ${escapeHTML(label)}

    </div>

  `;
}


// ==========================
// OVERDUE LOGIC
// ==========================

function isOverdue(
  dateValue,
  status
) {

  if (
    status ===
    "completed"
  ) {

    return false;
  }


  if (!dateValue) {

    return false;
  }


  return (

    parseDateOnly(
      dateValue
    )

    <

    getTodayDate()

  );
}


// ==========================
// DATE HELPERS
// ==========================

function normalizeDateString(
  value
) {

  if (!value) {
    return "";
  }


  return String(value)
    .slice(
      0,
      10
    );
}


function parseDateOnly(
  value
) {

  if (!value) {

    return null;
  }


  const dateString =
    String(value)
      .slice(
        0,
        10
      );


  const parts =
    dateString.split(
      "-"
    );


  if (
    parts.length !== 3
  ) {

    return new Date(
      value
    );
  }


  return new Date(

    Number(
      parts[0]
    ),

    Number(
      parts[1]
    ) - 1,

    Number(
      parts[2]
    )

  );
}


function getTodayDate() {

  const now =
    new Date();


  return new Date(

    now.getFullYear(),

    now.getMonth(),

    now.getDate()

  );
}


function formatDateKey(
  date
) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );


  const day =
    String(
      date.getDate()
    )
      .padStart(
        2,
        "0"
      );


  return (
    year +
    "-" +
    month +
    "-" +
    day
  );
}


function isSameDate(
  firstDate,
  secondDate
) {

  return (

    firstDate.getFullYear() ===
      secondDate.getFullYear()

    &&

    firstDate.getMonth() ===
      secondDate.getMonth()

    &&

    firstDate.getDate() ===
      secondDate.getDate()

  );
}


// ==========================
// SECURITY
// ==========================

function escapeHTML(
  value
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value ||
    "";


  return div.innerHTML;
}


// ==========================
// START
// ==========================

startCalendar();