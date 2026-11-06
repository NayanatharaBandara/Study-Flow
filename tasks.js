let user = null;

let tasks = [];


// ==========================
// ELEMENTS
// ==========================

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const openTaskModal =
  document.getElementById(
    "openTaskModal"
  );


const closeTaskModal =
  document.getElementById(
    "closeTaskModal"
  );


const taskModal =
  document.getElementById(
    "taskModal"
  );


const taskForm =
  document.getElementById(
    "taskForm"
  );


const taskList =
  document.getElementById(
    "taskList"
  );


const taskFilter =
  document.getElementById(
    "taskFilter"
  );


const priorityFilter =
  document.getElementById(
    "priorityFilter"
  );


const taskSearch =
  document.getElementById(
    "taskSearch"
  );


const resultSummary =
  document.getElementById(
    "resultSummary"
  );


const taskIdInput =
  document.getElementById(
    "taskId"
  );


const taskModalTitle =
  document.getElementById(
    "taskModalTitle"
  );


const saveTaskButton =
  document.getElementById(
    "saveTaskButton"
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

  sidebar
    .classList
    .add(
      "mobile-open"
    );


  sidebarOverlay
    .classList
    .add(
      "show"
    );


  document.body.style.overflow =
    "hidden";
}


function closeMobileSidebar() {

  sidebar
    .classList
    .remove(
      "mobile-open"
    );


  sidebarOverlay
    .classList
    .remove(
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


      if (
        taskModal
          .classList
          .contains(
            "show"
          )
      ) {

        closeModal();
      }
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
// START PAGE
// ==========================

async function startTasksPage() {

  const loggedIn =
    await loadSession();


  if (!loggedIn) {
    return;
  }


  await loadTasks();
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
// OPEN ADD MODAL
// ==========================

openTaskModal.addEventListener(
  "click",
  function () {

    resetTaskForm();


    taskModal
      .classList
      .add(
        "show"
      );
  }
);


// ==========================
// CLOSE MODAL
// ==========================

closeTaskModal.addEventListener(
  "click",
  closeModal
);


taskModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      taskModal
    ) {

      closeModal();
    }
  }
);


function closeModal() {

  taskModal
    .classList
    .remove(
      "show"
    );


  resetTaskForm();
}


function resetTaskForm() {

  taskForm.reset();


  taskIdInput.value =
    "";


  taskModalTitle.textContent =
    "Add New Task";


  saveTaskButton.textContent =
    "Save Task";


  document
    .getElementById(
      "taskPriority"
    )
    .value =
    "medium";
}


// ==========================
// LOAD TASKS
// ==========================

async function loadTasks() {

  try {

    const response =
      await fetch(
        `/api/tasks/${user.id}`
      );


    if (
      response.status === 401
    ) {

      window.location.href =
        "/login.html";

      return;
    }


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Could not load tasks."
      );

      return;
    }


    tasks =
      data;


    renderTasks();

  } catch (error) {

    console.error(
      "Error loading tasks:",
      error
    );
  }
}


// ==========================
// SAVE / UPDATE TASK
// ==========================

taskForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const taskId =
      taskIdInput.value;


    const title =
      document
        .getElementById(
          "taskTitle"
        )
        .value
        .trim();


    const description =
      document
        .getElementById(
          "taskDescription"
        )
        .value
        .trim();


    const dueDate =
      document
        .getElementById(
          "taskDueDate"
        )
        .value;


    const priority =
      document
        .getElementById(
          "taskPriority"
        )
        .value;


    if (
      !title ||
      !dueDate
    ) {

      alert(
        "Please enter a task title and due date."
      );

      return;
    }


    try {

      let response;


      // EDIT

      if (taskId) {

        const existingTask =
          tasks.find(
            task =>
              Number(
                task.id
              ) ===
              Number(
                taskId
              )
          );


        if (!existingTask) {

          alert(
            "Task could not be found."
          );

          return;
        }


        response =
          await fetch(
            `/api/tasks/${taskId}`,
            {

              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({

                  title,

                  description,

                  due_date:
                    dueDate,

                  priority,

                  status:
                    existingTask.status

                })
            }
          );
      }


      // ADD

      else {

        response =
          await fetch(
            "/api/tasks",
            {

              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({

                  title,

                  description,

                  due_date:
                    dueDate,

                  priority

                })
            }
          );
      }


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Could not save task."
        );

        return;
      }


      closeModal();


      await loadTasks();

  } catch (error) {

      console.error(
        "Error saving task:",
        error
      );


      alert(
        "Could not save task."
      );
    }
  }
);


// ==========================
// EDIT TASK
// ==========================

function editTask(id) {

  const task =
    tasks.find(
      task =>
        Number(
          task.id
        ) ===
        Number(id)
    );


  if (!task) {
    return;
  }


  taskIdInput.value =
    task.id;


  document
    .getElementById(
      "taskTitle"
    )
    .value =
    task.title;


  document
    .getElementById(
      "taskDescription"
    )
    .value =
    task.description ||
    "";


  document
    .getElementById(
      "taskDueDate"
    )
    .value =
    formatDateForInput(
      task.due_date
    );


  document
    .getElementById(
      "taskPriority"
    )
    .value =
    task.priority;


  taskModalTitle.textContent =
    "Edit Task";


  saveTaskButton.textContent =
    "Update Task";


  taskModal
    .classList
    .add(
      "show"
    );
}


// ==========================
// COMPLETE TASK
// ==========================

async function completeTask(id) {

  const task =
    tasks.find(
      task =>
        Number(
          task.id
        ) ===
        Number(id)
    );


  if (!task) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/tasks/${id}`,
        {

          method:
            "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              title:
                task.title,

              description:
                task.description ||
                "",

              due_date:
                formatDateForInput(
                  task.due_date
                ),

              priority:
                task.priority,

              status:
                "completed"

            })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Could not complete task."
      );

      return;
    }


    await loadTasks();

  } catch (error) {

    console.error(
      "Error completing task:",
      error
    );
  }
}


// ==========================
// DELETE TASK
// ==========================

async function deleteTask(id) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this task?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/tasks/${id}`,
        {
          method:
            "DELETE"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Could not delete task."
      );

      return;
    }


    await loadTasks();

  } catch (error) {

    console.error(
      "Error deleting task:",
      error
    );
  }
}


// ==========================
// SEARCH / FILTER
// ==========================

taskSearch.addEventListener(
  "input",
  renderTasks
);


taskFilter.addEventListener(
  "change",
  renderTasks
);


priorityFilter.addEventListener(
  "change",
  renderTasks
);


// ==========================
// RENDER TASKS
// ==========================

function renderTasks() {

  const searchValue =
    taskSearch.value
      .trim()
      .toLowerCase();


  const statusValue =
    taskFilter.value;


  const priorityValue =
    priorityFilter.value;


  let filteredTasks =
    [...tasks];


  if (searchValue) {

    filteredTasks =
      filteredTasks.filter(
        task => {

          const title =
            String(
              task.title ||
              ""
            ).toLowerCase();


          const description =
            String(
              task.description ||
              ""
            ).toLowerCase();


          return (
            title.includes(
              searchValue
            ) ||

            description.includes(
              searchValue
            )
          );
        }
      );
  }


  if (
    statusValue ===
    "pending"
  ) {

    filteredTasks =
      filteredTasks.filter(
        task =>
          task.status ===
          "pending"
      );
  }


  else if (
    statusValue ===
    "completed"
  ) {

    filteredTasks =
      filteredTasks.filter(
        task =>
          task.status ===
          "completed"
      );
  }


  else if (
    statusValue ===
    "overdue"
  ) {

    filteredTasks =
      filteredTasks.filter(
        task =>
          isTaskOverdue(task)
      );
  }


  if (
    priorityValue !==
    "all"
  ) {

    filteredTasks =
      filteredTasks.filter(
        task =>
          task.priority ===
          priorityValue
      );
  }


  filteredTasks.sort(
    (a, b) => {

      const aOverdue =
        isTaskOverdue(a);


      const bOverdue =
        isTaskOverdue(b);


      if (
        aOverdue &&
        !bOverdue
      ) {

        return -1;
      }


      if (
        !aOverdue &&
        bOverdue
      ) {

        return 1;
      }


      return (
        parseDateOnly(
          a.due_date
        )
        -
        parseDateOnly(
          b.due_date
        )
      );
    }
  );


  resultSummary.textContent =
    `Showing ${filteredTasks.length} of ${tasks.length} tasks`;


  if (
    filteredTasks.length ===
    0
  ) {

    taskList.innerHTML = `

      <div class="empty-state">

        <p>
          No tasks found.
        </p>

        <span>
          Try changing your search or filters.
        </span>

      </div>

    `;


    updateStatistics();

    return;
  }


  taskList.innerHTML =
    filteredTasks
      .map(
        task =>
          createTaskHTML(task)
      )
      .join("");


  updateStatistics();
}


// ==========================
// TASK HTML
// ==========================

function createTaskHTML(task) {

  const overdue =
    isTaskOverdue(task);


  const itemClass =
    overdue
      ? "task-item overdue-task"

      : task.status ===
        "completed"

        ? "task-item completed-task"

        : "task-item";


  return `

    <div class="${itemClass}">

      <div class="task-info">

        <h3>
          ${escapeHTML(
            task.title
          )}
        </h3>


        <p>
          ${escapeHTML(
            task.description ||
            "No description"
          )}
        </p>


        <p>

          Due:
          ${formatDate(
            task.due_date
          )}

        </p>


        <div class="task-badges">

          <span
            class="badge ${task.priority}"
          >
            ${escapeHTML(
              task.priority
            )}
          </span>


          <span
            class="badge ${task.status}"
          >
            ${escapeHTML(
              task.status
            )}
          </span>


          ${
            overdue
              ? `

                <span
                  class="badge overdue"
                >
                  Overdue
                </span>

              `
              : ""
          }

        </div>

      </div>


      <div class="task-actions">

        <button
          type="button"
          title="Edit task"
          onclick="editTask(${task.id})"
        >
          ✏️
        </button>


        ${
          task.status ===
          "pending"
            ? `

              <button
                type="button"
                class="complete-btn"
                title="Mark completed"
                onclick="completeTask(${task.id})"
              >
                ✓
              </button>

            `
            : ""
        }


        <button
          type="button"
          class="delete-btn"
          title="Delete task"
          onclick="deleteTask(${task.id})"
        >
          🗑
        </button>

      </div>

    </div>

  `;
}


// ==========================
// OVERDUE LOGIC
// ==========================

function isTaskOverdue(task) {

  if (
    task.status ===
    "completed"
  ) {

    return false;
  }


  if (!task.due_date) {

    return false;
  }


  const dueDate =
    parseDateOnly(
      task.due_date
    );


  const today =
    getTodayDate();


  return (
    dueDate < today
  );
}


// ==========================
// STATISTICS
// ==========================

function updateStatistics() {

  const pending =
    tasks.filter(
      task =>
        task.status ===
        "pending"
    ).length;


  const completed =
    tasks.filter(
      task =>
        task.status ===
        "completed"
    ).length;


  const overdue =
    tasks.filter(
      task =>
        isTaskOverdue(task)
    ).length;


  const highPriority =
    tasks.filter(
      task =>
        task.priority ===
        "high"
    ).length;


  document
    .getElementById(
      "totalTasks"
    )
    .textContent =
    tasks.length;


  document
    .getElementById(
      "pendingTasks"
    )
    .textContent =
    pending;


  document
    .getElementById(
      "completedTasks"
    )
    .textContent =
    completed;


  document
    .getElementById(
      "overdueTasks"
    )
    .textContent =
    overdue;


  document
    .getElementById(
      "highPriorityTasks"
    )
    .textContent =
    highPriority;
}


// ==========================
// DATE HELPERS
// ==========================

function parseDateOnly(value) {

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
    dateString.split("-");


  if (
    parts.length !== 3
  ) {

    return new Date(value);
  }


  return new Date(

    Number(parts[0]),

    Number(parts[1]) - 1,

    Number(parts[2])

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


function formatDate(value) {

  if (!value) {
    return "-";
  }


  const date =
    parseDateOnly(value);


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


function formatDateForInput(value) {

  if (!value) {
    return "";
  }


  return String(value)
    .slice(
      0,
      10
    );
}


// ==========================
// SECURITY
// ==========================

function escapeHTML(value) {

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

startTasksPage();