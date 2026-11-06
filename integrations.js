let user = null;

let lmsAssignments = [];


// ==========================
// ELEMENTS
// ==========================

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const platformName =
  document.getElementById(
    "platformName"
  );


const connectionStatus =
  document.getElementById(
    "connectionStatus"
  );


const externalAssignmentList =
  document.getElementById(
    "externalAssignmentList"
  );


const refreshButton =
  document.getElementById(
    "refreshButton"
  );


const integrationMessage =
  document.getElementById(
    "integrationMessage"
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

async function startIntegrationsPage() {

  const loggedIn =
    await loadSession();


  if (!loggedIn) {
    return;
  }


  await loadDemoLMS();
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
// REFRESH
// ==========================

refreshButton.addEventListener(
  "click",
  async function () {

    refreshButton.disabled =
      true;


    refreshButton.textContent =
      "Refreshing...";


    await loadDemoLMS();


    refreshButton.disabled =
      false;


    refreshButton.textContent =
      "↻ Refresh";
  }
);


// ==========================
// LOAD DEMO LMS
// ==========================

async function loadDemoLMS() {

  externalAssignmentList.innerHTML = `

    <div class="loading-state">
      Loading LMS assignments...
    </div>

  `;


  hideMessage();


  try {

    const response =
      await fetch(
        "/api/integrations/demo-lms"
      );


    if (
      response.status ===
      401
    ) {

      window.location.href =
        "/login.html";


      return;
    }


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Could not load LMS."
      );
    }


    platformName.textContent =
      data.platform ||
      "Demo University LMS";


    updateConnectionStatus(
      data.connected
    );


    lmsAssignments =
      Array.isArray(
        data.assignments
      )
        ? data.assignments
        : [];


    renderAssignments();

  } catch (error) {

    console.error(
      "LMS loading error:",
      error
    );


    updateConnectionStatus(
      false
    );


    externalAssignmentList.innerHTML = `

      <div class="empty-state">
        Could not load LMS assignments.
      </div>

    `;


    showMessage(
      "Could not connect to the Demo LMS.",
      "error"
    );
  }
}


// ==========================
// CONNECTION STATUS
// ==========================

function updateConnectionStatus(
  connected
) {

  if (connected) {

    connectionStatus.textContent =
      "● Connected";


    connectionStatus.className =
      "status-badge connected";
  }

  else {

    connectionStatus.textContent =
      "● Disconnected";


    connectionStatus.className =
      "status-badge disconnected";
  }
}


// ==========================
// RENDER ASSIGNMENTS
// ==========================

function renderAssignments() {

  if (
    lmsAssignments.length ===
    0
  ) {

    externalAssignmentList.innerHTML = `

      <div class="empty-state">

        No LMS assignments are currently available.

      </div>

    `;


    return;
  }


  externalAssignmentList.innerHTML =
    lmsAssignments
      .map(
        assignment =>
          createAssignmentHTML(
            assignment
          )
      )
      .join("");
}


// ==========================
// ASSIGNMENT CARD
// ==========================

function createAssignmentHTML(
  assignment
) {

  const priority =
    assignment.priority ||
    "medium";


  const source =
    assignment.source ||
    "Demo LMS";


  return `

    <div class="external-assignment-card">

      <div class="external-assignment-info">

        <div class="external-subject">

          ${escapeHTML(
            assignment.subject
          )}

        </div>


        <h3>

          ${escapeHTML(
            assignment.title
          )}

        </h3>


        <p class="external-assignment-description">

          ${escapeHTML(
            assignment.description ||
            "No description provided."
          )}

        </p>


        <div class="external-details">

          <span
            class="detail-badge source"
          >

            🔗
            ${escapeHTML(source)}

          </span>


          <span
            class="detail-badge ${escapeHTML(priority)}"
          >

            ${escapeHTML(priority)}
            priority

          </span>


          <span class="due-text">

            📅 Due:
            ${formatDate(
              assignment.due_date
            )}

          </span>

        </div>

      </div>


      <button
        class="import-btn"
        type="button"
        data-external-id="${escapeHTML(
          assignment.external_id
        )}"
      >
        Import Assignment
      </button>

    </div>

  `;
}


// ==========================
// IMPORT CLICK
// ==========================

externalAssignmentList.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        ".import-btn"
      );


    if (!button) {
      return;
    }


    const externalId =
      button.dataset.externalId;


    importAssignment(
      externalId,
      button
    );
  }
);


// ==========================
// IMPORT ASSIGNMENT
// ==========================

async function importAssignment(
  externalId,
  button
) {

  const assignment =
    lmsAssignments.find(
      item =>
        String(
          item.external_id
        ) ===
        String(
          externalId
        )
    );


  if (!assignment) {

    showMessage(
      "Assignment could not be found.",
      "error"
    );


    return;
  }


  button.disabled =
    true;


  button.textContent =
    "Importing...";


  hideMessage();


  try {

    const response =
      await fetch(
        "/api/integrations/import-assignment",
        {

          method:
            "POST",


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
                normalizeDate(
                  assignment.due_date
                ),

              priority:
                assignment.priority ||
                "medium",

              source:
                assignment.source ||
                "Demo LMS",

              external_id:
                assignment.external_id,

              external_url:
                assignment.external_url ||
                ""

            })

        }
      );


    const data =
      await response.json();


    // ALREADY IMPORTED

    if (
      response.status ===
      409
    ) {

      button.disabled =
        true;


      button.textContent =
        "✓ Already Imported";


      showMessage(
        data.message ||
        "This assignment has already been imported.",
        "info"
      );


      return;
    }


    if (!response.ok) {

      button.disabled =
        false;


      button.textContent =
        "Import Assignment";


      showMessage(
        data.message ||
        "Could not import assignment.",
        "error"
      );


      return;
    }


    button.disabled =
      true;


    button.textContent =
      "✓ Imported";


    showMessage(
      "Assignment imported successfully. It is now available on the Assignments page.",
      "success"
    );

  } catch (error) {

    console.error(
      "Import error:",
      error
    );


    button.disabled =
      false;


    button.textContent =
      "Import Assignment";


    showMessage(
      "Could not import assignment.",
      "error"
    );
  }
}


// ==========================
// MESSAGE
// ==========================

function showMessage(
  message,
  type
) {

  integrationMessage.textContent =
    message;


  integrationMessage.className =
    `integration-message show ${type}`;
}


function hideMessage() {

  integrationMessage.textContent =
    "";


  integrationMessage.className =
    "integration-message";
}


// ==========================
// DATE
// ==========================

function normalizeDate(value) {

  if (!value) {
    return "";
  }


  return String(value)
    .slice(
      0,
      10
    );
}


function parseDateOnly(value) {

  if (!value) {
    return null;
  }


  const dateString =
    normalizeDate(value);


  const parts =
    dateString.split(
      "-"
    );


  if (
    parts.length !==
    3
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


function formatDate(value) {

  if (!value) {
    return "-";
  }


  const date =
    parseDateOnly(
      value
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


// ==========================
// SECURITY
// ==========================

function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value == null
      ? ""
      : String(value);


  return div.innerHTML;
}


// ==========================
// START
// ==========================

startIntegrationsPage();