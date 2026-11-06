let user = null;

let tasks = [];
let assignments = [];
let exams = [];

let notifications = [];


// ==========================
// ELEMENTS
// ==========================

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const notificationButton =
  document.getElementById(
    "notificationButton"
  );


const notificationDropdown =
  document.getElementById(
    "notificationDropdown"
  );


const notificationCount =
  document.getElementById(
    "notificationCount"
  );


const notificationList =
  document.getElementById(
    "notificationList"
  );


const notificationTotalText =
  document.getElementById(
    "notificationTotalText"
  );


// MOBILE MENU

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


// CLOSE WHEN NAV LINK IS CLICKED

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


// ESCAPE KEY

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Escape"
    ) {

      closeMobileSidebar();


      notificationDropdown
        .classList
        .remove(
          "show"
        );
    }
  }
);


// RESET MOBILE SIDEBAR
// WHEN RESIZING TO DESKTOP

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

async function startDashboard() {

  const sessionReady =
    await loadSession();


  if (!sessionReady) {
    return;
  }


  await loadDashboard();
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


    document
      .getElementById(
        "welcomeUser"
      )
      .textContent =
      "Welcome, " +
      user.name +
      " 👋";


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
// NOTIFICATION DROPDOWN
// ==========================

notificationButton.addEventListener(
  "click",
  function (event) {

    event.stopPropagation();


    notificationDropdown
      .classList
      .toggle(
        "show"
      );
  }
);


notificationDropdown.addEventListener(
  "click",
  function (event) {

    event.stopPropagation();
  }
);


document.addEventListener(
  "click",
  function () {

    notificationDropdown
      .classList
      .remove(
        "show"
      );
  }
);


// ==========================
// LOAD DASHBOARD
// ==========================

async function loadDashboard() {

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


    tasks =
      await taskResponse.json();


    assignments =
      await assignmentResponse.json();


    exams =
      await examResponse.json();


    updateStats();

    updateOverdueSummary();

    renderNextDeadline();

    renderNextExam();

    renderRecentTasks();

    renderRecentAssignments();

    generateNotifications();

    renderNotifications();

  } catch (error) {

    console.error(
      "Dashboard loading error:",
      error
    );
  }
}


// ==========================
// GENERATE NOTIFICATIONS
// ==========================

function generateNotifications() {

  notifications = [];


  tasks.forEach(
    task => {

      if (
        task.status ===
        "completed"
      ) {
        return;
      }


      const days =
        getDaysDifference(
          task.due_date
        );


      if (days < 0) {

        notifications.push({

          type:
            "overdue",

          icon:
            "🚨",

          title:
            "Task overdue",

          message:
            `${task.title} is ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue.`,

          date:
            task.due_date,

          priority:
            1
        });

      } else if (
        days === 0
      ) {

        notifications.push({

          type:
            "today",

          icon:
            "📝",

          title:
            "Task due today",

          message:
            `${task.title} is due today.`,

          date:
            task.due_date,

          priority:
            2
        });

      } else if (
        days === 1
      ) {

        notifications.push({

          type:
            "tomorrow",

          icon:
            "📝",

          title:
            "Task due tomorrow",

          message:
            `${task.title} is due tomorrow.`,

          date:
            task.due_date,

          priority:
            3
        });
      }

    }
  );


  assignments.forEach(
    assignment => {

      if (
        assignment.status ===
        "completed"
      ) {
        return;
      }


      const days =
        getDaysDifference(
          assignment.due_date
        );


      if (days < 0) {

        notifications.push({

          type:
            "overdue",

          icon:
            "🚨",

          title:
            "Assignment overdue",

          message:
            `${assignment.subject}: ${assignment.title} is ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue.`,

          date:
            assignment.due_date,

          priority:
            1
        });

      } else if (
        days === 0
      ) {

        notifications.push({

          type:
            "today",

          icon:
            "📚",

          title:
            "Assignment due today",

          message:
            `${assignment.subject}: ${assignment.title} is due today.`,

          date:
            assignment.due_date,

          priority:
            2
        });

      } else if (
        days === 1
      ) {

        notifications.push({

          type:
            "tomorrow",

          icon:
            "📚",

          title:
            "Assignment due tomorrow",

          message:
            `${assignment.subject}: ${assignment.title} is due tomorrow.`,

          date:
            assignment.due_date,

          priority:
            3
        });
      }

    }
  );


  exams.forEach(
    exam => {

      if (
        exam.status !==
        "upcoming"
      ) {
        return;
      }


      const days =
        getDaysDifference(
          exam.exam_date
        );


      if (days === 0) {

        notifications.push({

          type:
            "exam",

          icon:
            "📅",

          title:
            "Exam today",

          message:
            `${exam.subject}: ${exam.title} is today.`,

          date:
            exam.exam_date,

          priority:
            1
        });

      } else if (
        days === 1
      ) {

        notifications.push({

          type:
            "exam",

          icon:
            "📅",

          title:
            "Exam tomorrow",

          message:
            `${exam.subject}: ${exam.title} is tomorrow.`,

          date:
            exam.exam_date,

          priority:
            2
        });

      } else if (
        days > 1 &&
        days <= 3
      ) {

        notifications.push({

          type:
            "exam",

          icon:
            "📅",

          title:
            "Exam approaching",

          message:
            `${exam.subject}: ${exam.title} is in ${days} days.`,

          date:
            exam.exam_date,

          priority:
            3
        });
      }

    }
  );


  notifications.sort(
    (a, b) => {

      if (
        a.priority !==
        b.priority
      ) {

        return (
          a.priority -
          b.priority
        );
      }


      return (
        parseDateOnly(
          a.date
        )
        -
        parseDateOnly(
          b.date
        )
      );
    }
  );
}


// ==========================
// RENDER NOTIFICATIONS
// ==========================

function renderNotifications() {

  const count =
    notifications.length;


  notificationTotalText
    .textContent =
    count;


  notificationCount
    .textContent =
    count;


  if (
    count === 0
  ) {

    notificationCount
      .classList
      .add(
        "hidden"
      );


    notificationList
      .innerHTML = `

        <div class="notification-empty">

          <span>
            🔔
          </span>

          <p>
            No notifications right now.
          </p>

        </div>

      `;


    return;
  }


  notificationCount
    .classList
    .remove(
      "hidden"
    );


  notificationList
    .innerHTML =
    notifications
      .map(
        notification => {

          let className =
            "";


          if (
            notification.type ===
            "overdue"
          ) {

            className =
              "overdue-notification";

          } else if (
            notification.type ===
            "today"
          ) {

            className =
              "today-notification";

          } else if (
            notification.type ===
            "exam"
          ) {

            className =
              "exam-notification";
          }


          return `

            <div
              class="notification-item ${className}"
            >

              <div
                class="notification-item-icon"
              >
                ${notification.icon}
              </div>


              <div
                class="notification-item-content"
              >

                <h4>
                  ${escapeHTML(
                    notification.title
                  )}
                </h4>


                <p>
                  ${escapeHTML(
                    notification.message
                  )}
                </p>

              </div>

            </div>

          `;
        }
      )
      .join("");
}


// ==========================
// STATS
// ==========================

function updateStats() {

  const pendingTasks =
    tasks.filter(
      task =>
        task.status ===
        "pending"
    ).length;


  const pendingAssignments =
    assignments.filter(
      assignment =>
        assignment.status ===
        "pending"
    ).length;


  const upcomingExams =
    exams.filter(
      exam =>
        exam.status ===
        "upcoming"
    ).length;


  const completedItems =
    tasks.filter(
      task =>
        task.status ===
        "completed"
    ).length
    +
    assignments.filter(
      assignment =>
        assignment.status ===
        "completed"
    ).length
    +
    exams.filter(
      exam =>
        exam.status ===
        "completed"
    ).length;


  const overdueTasks =
    tasks.filter(
      task =>
        isOverdue(
          task.due_date,
          task.status
        )
    ).length;


  const overdueAssignments =
    assignments.filter(
      assignment =>
        isOverdue(
          assignment.due_date,
          assignment.status
        )
    ).length;


  const totalOverdue =
    overdueTasks +
    overdueAssignments;


  document
    .getElementById(
      "pendingTasks"
    )
    .textContent =
    pendingTasks;


  document
    .getElementById(
      "pendingAssignments"
    )
    .textContent =
    pendingAssignments;


  document
    .getElementById(
      "upcomingExams"
    )
    .textContent =
    upcomingExams;


  document
    .getElementById(
      "completedItems"
    )
    .textContent =
    completedItems;


  document
    .getElementById(
      "overdueItems"
    )
    .textContent =
    totalOverdue;
}


// ==========================
// OVERDUE SUMMARY
// ==========================

function updateOverdueSummary() {

  const overdueTasks =
    tasks.filter(
      task =>
        isOverdue(
          task.due_date,
          task.status
        )
    ).length;


  const overdueAssignments =
    assignments.filter(
      assignment =>
        isOverdue(
          assignment.due_date,
          assignment.status
        )
    ).length;


  const total =
    overdueTasks +
    overdueAssignments;


  document
    .getElementById(
      "overdueTasks"
    )
    .textContent =
    overdueTasks;


  document
    .getElementById(
      "overdueAssignments"
    )
    .textContent =
    overdueAssignments;


  const message =
    document.getElementById(
      "overdueMessage"
    );


  if (
    total === 0
  ) {

    message.textContent =
      "Great! You have no overdue tasks or assignments.";

  } else {

    message.textContent =
      `You have ${total} overdue item${total === 1 ? "" : "s"} that need attention.`;
  }
}


// ==========================
// MOST URGENT DEADLINE
// ==========================

function renderNextDeadline() {

  const deadlines =
    [];


  tasks
    .filter(
      task =>
        task.status ===
        "pending"
    )
    .forEach(
      task => {

        deadlines.push({

          type:
            "Task",

          title:
            task.title,

          date:
            task.due_date,

          overdue:
            isOverdue(
              task.due_date,
              task.status
            )

        });
      }
    );


  assignments
    .filter(
      assignment =>
        assignment.status ===
        "pending"
    )
    .forEach(
      assignment => {

        deadlines.push({

          type:
            "Assignment",

          title:
            assignment.title,

          date:
            assignment.due_date,

          overdue:
            isOverdue(
              assignment.due_date,
              assignment.status
            )

        });
      }
    );


  deadlines.sort(
    (a, b) => {

      if (
        a.overdue &&
        !b.overdue
      ) {
        return -1;
      }


      if (
        !a.overdue &&
        b.overdue
      ) {
        return 1;
      }


      return (
        parseDateOnly(
          a.date
        )
        -
        parseDateOnly(
          b.date
        )
      );
    }
  );


  const container =
    document.getElementById(
      "nextDeadline"
    );


  if (
    deadlines.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <p>
          No upcoming deadlines.
        </p>

      </div>

    `;

    return;
  }


  const deadline =
    deadlines[0];


  container.innerHTML = `

    <div
      class="summary-item ${
        deadline.overdue
          ? "urgent"
          : ""
      }"
    >

      <span
        class="summary-label ${
          deadline.overdue
            ? "overdue-label"
            : ""
        }"
      >

        ${
          deadline.overdue
            ? "Overdue "
            : ""
        }

        ${deadline.type}

      </span>


      <h3>
        ${escapeHTML(
          deadline.title
        )}
      </h3>


      <p
        class="${
          deadline.overdue
            ? "urgent-text"
            : ""
        }"
      >

        ${
          deadline.overdue
            ? "Was due:"
            : "Due:"
        }

        ${formatDate(
          deadline.date
        )}

      </p>


      <p>
        ${getDeadlineMessage(
          deadline.date
        )}
      </p>

    </div>

  `;
}


// ==========================
// NEXT EXAM
// ==========================

function renderNextExam() {

  const today =
    getTodayDate();


  const upcoming =
    exams
      .filter(
        exam => {

          return (
            exam.status ===
              "upcoming"
            &&
            parseDateOnly(
              exam.exam_date
            ) >= today
          );
        }
      )
      .sort(
        (a, b) =>
          parseDateOnly(
            a.exam_date
          )
          -
          parseDateOnly(
            b.exam_date
          )
      );


  const container =
    document.getElementById(
      "nextExam"
    );


  if (
    upcoming.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <p>
          No upcoming exams.
        </p>

      </div>

    `;

    return;
  }


  const exam =
    upcoming[0];


  container.innerHTML = `

    <div class="summary-item">

      <span
        class="summary-label"
      >

        ${escapeHTML(
          exam.subject
        )}

      </span>


      <h3>

        ${escapeHTML(
          exam.title
        )}

      </h3>


      <p>

        ${formatDate(
          exam.exam_date
        )}

        ${
          exam.exam_time
            ? " • " +
              formatTime(
                exam.exam_time
              )
            : ""
        }

      </p>


      <p>

        ${escapeHTML(
          exam.location ||
          "Location not specified"
        )}

      </p>


      <p>

        ${getDeadlineMessage(
          exam.exam_date
        )}

      </p>

    </div>

  `;
}


// ==========================
// RECENT TASKS
// ==========================

function renderRecentTasks() {

  const container =
    document.getElementById(
      "recentTasks"
    );


  const recent =
    [...tasks]
      .sort(
        (a, b) =>
          Number(b.id) -
          Number(a.id)
      )
      .slice(
        0,
        4
      );


  if (
    recent.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <p>
          No tasks found.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    recent
      .map(
        task => {

          const overdue =
            isOverdue(
              task.due_date,
              task.status
            );


          return `

            <div
              class="dashboard-list-item ${
                overdue
                  ? "overdue-row"
                  : ""
              }"
            >

              <div>

                <h3>
                  ${escapeHTML(
                    task.title
                  )}
                </h3>


                <p>

                  Due:
                  ${formatDate(
                    task.due_date
                  )}

                </p>

              </div>


              <span
                class="status-badge ${
                  overdue
                    ? "overdue"
                    : task.status
                }"
              >

                ${
                  overdue
                    ? "Overdue"
                    : escapeHTML(
                        task.status
                      )
                }

              </span>

            </div>

          `;
        }
      )
      .join("");
}


// ==========================
// RECENT ASSIGNMENTS
// ==========================

function renderRecentAssignments() {

  const container =
    document.getElementById(
      "recentAssignments"
    );


  const recent =
    [...assignments]
      .sort(
        (a, b) =>
          Number(b.id) -
          Number(a.id)
      )
      .slice(
        0,
        4
      );


  if (
    recent.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <p>
          No assignments found.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    recent
      .map(
        assignment => {

          const overdue =
            isOverdue(
              assignment.due_date,
              assignment.status
            );


          return `

            <div
              class="dashboard-list-item ${
                overdue
                  ? "overdue-row"
                  : ""
              }"
            >

              <div>

                <span
                  class="mini-subject"
                >
                  ${escapeHTML(
                    assignment.subject
                  )}
                </span>


                <h3>

                  ${escapeHTML(
                    assignment.title
                  )}

                </h3>


                <p>

                  Due:
                  ${formatDate(
                    assignment.due_date
                  )}

                </p>

              </div>


              <span
                class="status-badge ${
                  overdue
                    ? "overdue"
                    : assignment.status
                }"
              >

                ${
                  overdue
                    ? "Overdue"
                    : escapeHTML(
                        assignment.status
                      )
                }

              </span>

            </div>

          `;
        }
      )
      .join("");
}


// ==========================
// OVERDUE
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
// DAYS DIFFERENCE
// ==========================

function getDaysDifference(
  dateValue
) {

  if (!dateValue) {
    return 9999;
  }


  const target =
    parseDateOnly(
      dateValue
    );


  const today =
    getTodayDate();


  return Math.round(

    (
      target -
      today
    )

    /

    (
      1000 *
      60 *
      60 *
      24
    )

  );
}


// ==========================
// DEADLINE MESSAGE
// ==========================

function getDeadlineMessage(
  dateValue
) {

  const difference =
    getDaysDifference(
      dateValue
    );


  if (
    difference === 0
  ) {

    return "Due today";
  }


  if (
    difference === 1
  ) {

    return "Due tomorrow";
  }


  if (
    difference > 1
  ) {

    return `Due in ${difference} days`;
  }


  if (
    difference === -1
  ) {

    return "1 day overdue";
  }


  return `${Math.abs(
    difference
  )} days overdue`;
}


// ==========================
// DATE HELPERS
// ==========================

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


function formatDate(
  dateValue
) {

  if (!dateValue) {
    return "-";
  }


  const date =
    parseDateOnly(
      dateValue
    );


  return date.toLocaleDateString(
    undefined,
    {

      year:
        "numeric",

      month:
        "short",

      day:
        "numeric"

    }
  );
}


function formatTime(
  timeValue
) {

  if (!timeValue) {
    return "";
  }


  return String(
    timeValue
  ).slice(
    0,
    5
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
    value || "";


  return div.innerHTML;
}


// ==========================
// START
// ==========================

startDashboard();