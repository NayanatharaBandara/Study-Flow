let user = null;

let assignments = [];


// ==========================
// ELEMENTS
// ==========================

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const openAssignmentModal =
  document.getElementById(
    "openAssignmentModal"
  );


const closeAssignmentModal =
  document.getElementById(
    "closeAssignmentModal"
  );


const assignmentModal =
  document.getElementById(
    "assignmentModal"
  );


const assignmentForm =
  document.getElementById(
    "assignmentForm"
  );


const assignmentList =
  document.getElementById(
    "assignmentList"
  );


const assignmentFilter =
  document.getElementById(
    "assignmentFilter"
  );


const priorityFilter =
  document.getElementById(
    "priorityFilter"
  );


const assignmentSearch =
  document.getElementById(
    "assignmentSearch"
  );


const resultSummary =
  document.getElementById(
    "resultSummary"
  );


const assignmentIdInput =
  document.getElementById(
    "assignmentId"
  );


const assignmentModalTitle =
  document.getElementById(
    "assignmentModalTitle"
  );


const saveAssignmentButton =
  document.getElementById(
    "saveAssignmentButton"
  );


// MOBILE SIDEBAR

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

async function startAssignmentsPage() {

  const loggedIn =
    await loadSession();


  if (!loggedIn) {
    return;
  }


  await loadAssignments();
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
// OPEN MODAL
// ==========================

openAssignmentModal.addEventListener(
  "click",
  function () {

    resetAssignmentForm();


    assignmentModal
      .classList
      .add(
        "show"
      );
  }
);


// ==========================
// CLOSE MODAL
// ==========================

closeAssignmentModal.addEventListener(
  "click",
  closeModal
);


assignmentModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      assignmentModal
    ) {

      closeModal();
    }
  }
);


function closeModal() {

  assignmentModal
    .classList
    .remove(
      "show"
    );


  resetAssignmentForm();
}


function resetAssignmentForm() {

  assignmentForm.reset();


  assignmentIdInput.value =
    "";


  assignmentModalTitle.textContent =
    "Add New Assignment";


  saveAssignmentButton.textContent =
    "Save Assignment";


  document
    .getElementById(
      "assignmentPriority"
    )
    .value =
    "medium";
}


// ==========================
// ESCAPE KEY
// ==========================

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key !==
      "Escape"
    ) {
      return;
    }


    closeMobileSidebar();


    if (
      assignmentModal
        .classList
        .contains(
          "show"
        )
    ) {

      closeModal();
    }
  }
);


// ==========================
// LOAD ASSIGNMENTS
// ==========================

async function loadAssignments() {

  try {

    const response =
      await fetch(
        `/api/assignments/${user.id}`
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
        "Could not load assignments."
      );

      return;
    }


    assignments =
      data;


    renderAssignments();

  } catch (error) {

    console.error(
      "Error loading assignments:",
      error
    );
  }
}


// ==========================
// SAVE / UPDATE
// ==========================

assignmentForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const assignmentId =
      assignmentIdInput.value;


    const subject =
      document
        .getElementById(
          "assignmentSubject"
        )
        .value
        .trim();


    const title =
      document
        .getElementById(
          "assignmentTitle"
        )
        .value
        .trim();


    const description =
      document
        .getElementById(
          "assignmentDescription"
        )
        .value
        .trim();


    const dueDate =
      document
        .getElementById(
          "assignmentDueDate"
        )
        .value;


    const priority =
      document
        .getElementById(
          "assignmentPriority"
        )
        .value;


    if (
      !subject ||
      !title ||
      !dueDate
    ) {

      alert(
        "Please enter subject, title and due date."
      );

      return;
    }


    try {

      let response;


      // EDIT

      if (assignmentId) {

        const existingAssignment =
          assignments.find(
            assignment =>
              Number(
                assignment.id
              ) ===
              Number(
                assignmentId
              )
          );


        if (
          !existingAssignment
        ) {

          alert(
            "Assignment could not be found."
          );

          return;
        }


        response =
          await fetch(
            `/api/assignments/${assignmentId}`,
            {

              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({

                  subject,

                  title,

                  description,

                  due_date:
                    dueDate,

                  priority,

                  status:
                    existingAssignment.status

                })
            }
          );
      }


      // ADD

      else {

        response =
          await fetch(
            "/api/assignments",
            {

              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({

                  subject,

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
          "Could not save assignment."
        );

        return;
      }


      closeModal();


      await loadAssignments();

    } catch (error) {

      console.error(
        "Error saving assignment:",
        error
      );


      alert(
        "Could not save assignment."
      );
    }
  }
);


// ==========================
// EDIT
// ==========================

function editAssignment(id) {

  const assignment =
    assignments.find(
      assignment =>
        Number(
          assignment.id
        ) ===
        Number(id)
    );


  if (!assignment) {
    return;
  }


  assignmentIdInput.value =
    assignment.id;


  document
    .getElementById(
      "assignmentSubject"
    )
    .value =
    assignment.subject;


  document
    .getElementById(
      "assignmentTitle"
    )
    .value =
    assignment.title;


  document
    .getElementById(
      "assignmentDescription"
    )
    .value =
    assignment.description ||
    "";


  document
    .getElementById(
      "assignmentDueDate"
    )
    .value =
    formatDateForInput(
      assignment.due_date
    );


  document
    .getElementById(
      "assignmentPriority"
    )
    .value =
    assignment.priority;


  assignmentModalTitle.textContent =
    "Edit Assignment";


  saveAssignmentButton.textContent =
    "Update Assignment";


  assignmentModal
    .classList
    .add(
      "show"
    );
}


// ==========================
// COMPLETE
// ==========================

async function completeAssignment(
  id
) {

  const assignment =
    assignments.find(
      assignment =>
        Number(
          assignment.id
        ) ===
        Number(id)
    );


  if (!assignment) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/assignments/${id}`,
        {

          method:
            "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              subject:
                assignment.subject,

              title:
                assignment.title,

              description:
                assignment.description ||
                "",

              due_date:
                formatDateForInput(
                  assignment.due_date
                ),

              priority:
                assignment.priority,

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
        "Could not complete assignment."
      );

      return;
    }


    await loadAssignments();

  } catch (error) {

    console.error(
      "Error completing assignment:",
      error
    );
  }
}


// ==========================
// DELETE
// ==========================

async function deleteAssignment(
  id
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this assignment?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/assignments/${id}`,
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
        "Could not delete assignment."
      );

      return;
    }


    await loadAssignments();

  } catch (error) {

    console.error(
      "Error deleting assignment:",
      error
    );
  }
}


// ==========================
// SEARCH / FILTER EVENTS
// ==========================

assignmentSearch.addEventListener(
  "input",
  renderAssignments
);


assignmentFilter.addEventListener(
  "change",
  renderAssignments
);


priorityFilter.addEventListener(
  "change",
  renderAssignments
);


// ==========================
// RENDER
// ==========================

function renderAssignments() {

  const searchValue =
    assignmentSearch.value
      .trim()
      .toLowerCase();


  const statusValue =
    assignmentFilter.value;


  const priorityValue =
    priorityFilter.value;


  let filteredAssignments =
    [...assignments];


  // SEARCH

  if (searchValue) {

    filteredAssignments =
      filteredAssignments.filter(
        assignment => {

          const subject =
            String(
              assignment.subject ||
              ""
            ).toLowerCase();


          const title =
            String(
              assignment.title ||
              ""
            ).toLowerCase();


          const description =
            String(
              assignment.description ||
              ""
            ).toLowerCase();


          const source =
            String(
              assignment.source ||
              "StudyFlow"
            ).toLowerCase();


          return (
            subject.includes(
              searchValue
            ) ||

            title.includes(
              searchValue
            ) ||

            description.includes(
              searchValue
            ) ||

            source.includes(
              searchValue
            )
          );
        }
      );
  }


  // STATUS

  if (
    statusValue ===
    "pending"
  ) {

    filteredAssignments =
      filteredAssignments.filter(
        assignment =>
          assignment.status ===
          "pending"
      );
  }


  else if (
    statusValue ===
    "completed"
  ) {

    filteredAssignments =
      filteredAssignments.filter(
        assignment =>
          assignment.status ===
          "completed"
      );
  }


  else if (
    statusValue ===
    "overdue"
  ) {

    filteredAssignments =
      filteredAssignments.filter(
        assignment =>
          isAssignmentOverdue(
            assignment
          )
      );
  }


  // PRIORITY

  if (
    priorityValue !==
    "all"
  ) {

    filteredAssignments =
      filteredAssignments.filter(
        assignment =>
          assignment.priority ===
          priorityValue
      );
  }


  // SORT

  filteredAssignments.sort(
    (a, b) => {

      const aOverdue =
        isAssignmentOverdue(a);


      const bOverdue =
        isAssignmentOverdue(b);


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
    `Showing ${filteredAssignments.length} of ${assignments.length} assignments`;


  if (
    filteredAssignments.length ===
    0
  ) {

    assignmentList.innerHTML = `

      <div class="empty-state">

        <p>
          No assignments found.
        </p>

        <span>
          Try changing your search or filters.
        </span>

      </div>

    `;


    updateStats();

    return;
  }


  assignmentList.innerHTML =
    filteredAssignments
      .map(
        assignment =>
          createAssignmentHTML(
            assignment
          )
      )
      .join("");


  updateStats();
}


// ==========================
// ASSIGNMENT HTML
// ==========================

function createAssignmentHTML(
  assignment
) {

  const overdue =
    isAssignmentOverdue(
      assignment
    );


  const itemClass =
    overdue
      ? "assignment-item overdue-assignment"

      : assignment.status ===
        "completed"

        ? "assignment-item completed-assignment"

        : "assignment-item";


  const source =
    assignment.source ||
    "StudyFlow";


  const isExternal =
    source !==
    "StudyFlow";


  const safeUrl =
    getSafeExternalURL(
      assignment.external_url
    );


  return `

    <div class="${itemClass}">

      <div class="assignment-info">

        <div class="subject-name">

          ${escapeHTML(
            assignment.subject
          )}

        </div>


        <h3>

          ${escapeHTML(
            assignment.title
          )}

        </h3>


        <p>

          ${escapeHTML(
            assignment.description ||
            "No description"
          )}

        </p>


        <p>

          Due:
          ${formatDate(
            assignment.due_date
          )}

        </p>


        <div class="assignment-badges">

          <span
            class="badge ${assignment.priority}"
          >
            ${escapeHTML(
              assignment.priority
            )}
          </span>


          <span
            class="badge ${assignment.status}"
          >
            ${escapeHTML(
              assignment.status
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


          <span
            class="badge source-badge ${
              isExternal
                ? ""
                : "studyflow-source"
            }"
          >

            ${
              isExternal
                ? "🔗 "
                : "✦ "
            }

            ${escapeHTML(
              source
            )}

          </span>

        </div>


        <div class="assignment-source-row">

          <span class="source-text">

            ${
              isExternal
                ? "Imported from"
                : "Created in"
            }

            <strong>
              ${escapeHTML(
                source
              )}
            </strong>

          </span>


          ${
            safeUrl
              ? `

                <a
                  href="${escapeHTML(
                    safeUrl
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="open-source-link"
                >
                  🔗 Open Source
                </a>

              `
              : ""
          }

        </div>

      </div>


      <div class="assignment-actions">

        <button
          type="button"
          title="Edit assignment"
          onclick="editAssignment(${assignment.id})"
        >
          ✏️
        </button>


        ${
          assignment.status ===
          "pending"
            ? `

              <button
                type="button"
                class="complete-btn"
                title="Mark completed"
                onclick="completeAssignment(${assignment.id})"
              >
                ✓
              </button>

            `
            : ""
        }


        <button
          type="button"
          class="delete-btn"
          title="Delete assignment"
          onclick="deleteAssignment(${assignment.id})"
        >
          🗑
        </button>

      </div>

    </div>

  `;
}


// ==========================
// SAFE EXTERNAL URL
// ==========================

function getSafeExternalURL(
  value
) {

  if (!value) {
    return "";
  }


  try {

    const url =
      new URL(
        value
      );


    if (
      url.protocol !==
        "http:" &&
      url.protocol !==
        "https:"
    ) {

      return "";
    }


    return url.href;

  } catch (error) {

    return "";
  }
}


// ==========================
// OVERDUE
// ==========================

function isAssignmentOverdue(
  assignment
) {

  if (
    assignment.status ===
    "completed"
  ) {

    return false;
  }


  if (!assignment.due_date) {

    return false;
  }


  const dueDate =
    parseDateOnly(
      assignment.due_date
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

function updateStats() {

  const pending =
    assignments.filter(
      assignment =>
        assignment.status ===
        "pending"
    ).length;


  const completed =
    assignments.filter(
      assignment =>
        assignment.status ===
        "completed"
    ).length;


  const overdue =
    assignments.filter(
      assignment =>
        isAssignmentOverdue(
          assignment
        )
    ).length;


  const highPriority =
    assignments.filter(
      assignment =>
        assignment.priority ===
        "high"
    ).length;


  document
    .getElementById(
      "totalAssignments"
    )
    .textContent =
    assignments.length;


  document
    .getElementById(
      "pendingAssignments"
    )
    .textContent =
    pending;


  document
    .getElementById(
      "completedAssignments"
    )
    .textContent =
    completed;


  document
    .getElementById(
      "overdueAssignments"
    )
    .textContent =
    overdue;


  document
    .getElementById(
      "highPriorityAssignments"
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


function formatDateForInput(
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

startAssignmentsPage();