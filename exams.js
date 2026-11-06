let user = null;

let exams = [];


// ==========================
// ELEMENTS
// ==========================

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const openExamModal =
  document.getElementById(
    "openExamModal"
  );


const closeExamModal =
  document.getElementById(
    "closeExamModal"
  );


const examModal =
  document.getElementById(
    "examModal"
  );


const examForm =
  document.getElementById(
    "examForm"
  );


const examList =
  document.getElementById(
    "examList"
  );


const examFilter =
  document.getElementById(
    "examFilter"
  );


const examSearch =
  document.getElementById(
    "examSearch"
  );


const resultSummary =
  document.getElementById(
    "resultSummary"
  );


const examIdInput =
  document.getElementById(
    "examId"
  );


const examModalTitle =
  document.getElementById(
    "examModalTitle"
  );


const saveExamButton =
  document.getElementById(
    "saveExamButton"
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
// MOBILE SIDEBAR
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
// START
// ==========================

async function startExamsPage() {

  const loggedIn =
    await loadSession();


  if (!loggedIn) {
    return;
  }


  await loadExams();
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

openExamModal.addEventListener(
  "click",
  function () {

    resetExamForm();


    examModal
      .classList
      .add(
        "show"
      );
  }
);


// ==========================
// CLOSE MODAL
// ==========================

closeExamModal.addEventListener(
  "click",
  closeModal
);


examModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      examModal
    ) {

      closeModal();
    }
  }
);


function closeModal() {

  examModal
    .classList
    .remove(
      "show"
    );


  resetExamForm();
}


// ==========================
// RESET FORM
// ==========================

function resetExamForm() {

  examForm.reset();


  examIdInput.value =
    "";


  examModalTitle.textContent =
    "Add New Exam";


  saveExamButton.textContent =
    "Save Exam";
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
      examModal
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
// LOAD EXAMS
// ==========================

async function loadExams() {

  try {

    const response =
      await fetch(
        `/api/exams/${user.id}`
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

      alert(
        data.message ||
        "Could not load exams."
      );


      return;
    }


    exams =
      data;


    renderExams();

  } catch (error) {

    console.error(
      "Error loading exams:",
      error
    );
  }
}


// ==========================
// SAVE / UPDATE EXAM
// ==========================

examForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const examId =
      examIdInput.value;


    const subject =
      document
        .getElementById(
          "examSubject"
        )
        .value
        .trim();


    const title =
      document
        .getElementById(
          "examTitle"
        )
        .value
        .trim();


    const examDate =
      document
        .getElementById(
          "examDate"
        )
        .value;


    const examTime =
      document
        .getElementById(
          "examTime"
        )
        .value;


    const location =
      document
        .getElementById(
          "examLocation"
        )
        .value
        .trim();


    if (
      !subject ||
      !title ||
      !examDate
    ) {

      alert(
        "Please enter subject, exam title and exam date."
      );


      return;
    }


    try {

      let response;


      // ======================
      // UPDATE EXISTING
      // ======================

      if (examId) {

        const existingExam =
          exams.find(
            exam =>
              Number(
                exam.id
              ) ===
              Number(
                examId
              )
          );


        if (!existingExam) {

          alert(
            "Exam could not be found."
          );


          return;
        }


        response =
          await fetch(
            `/api/exams/${examId}`,
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

                  exam_date:
                    examDate,

                  exam_time:
                    examTime ||
                    null,

                  location,

                  status:
                    existingExam.status

                })

            }
          );

      }


      // ======================
      // CREATE NEW
      // ======================

      else {

        response =
          await fetch(
            "/api/exams",
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

                  exam_date:
                    examDate,

                  exam_time:
                    examTime ||
                    null,

                  location

                })

            }
          );

      }


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Could not save exam."
        );


        return;
      }


      closeModal();


      await loadExams();

    } catch (error) {

      console.error(
        "Error saving exam:",
        error
      );


      alert(
        "Could not save exam."
      );
    }
  }
);


// ==========================
// EDIT EXAM
// ==========================

function editExam(id) {

  const exam =
    exams.find(
      exam =>
        Number(
          exam.id
        ) ===
        Number(id)
    );


  if (!exam) {
    return;
  }


  examIdInput.value =
    exam.id;


  document
    .getElementById(
      "examSubject"
    )
    .value =
    exam.subject;


  document
    .getElementById(
      "examTitle"
    )
    .value =
    exam.title;


  document
    .getElementById(
      "examDate"
    )
    .value =
    formatDateForInput(
      exam.exam_date
    );


  document
    .getElementById(
      "examTime"
    )
    .value =
    formatTimeForInput(
      exam.exam_time
    );


  document
    .getElementById(
      "examLocation"
    )
    .value =
    exam.location ||
    "";


  examModalTitle.textContent =
    "Edit Exam";


  saveExamButton.textContent =
    "Update Exam";


  examModal
    .classList
    .add(
      "show"
    );
}


// ==========================
// COMPLETE EXAM
// ==========================

async function completeExam(id) {

  const exam =
    exams.find(
      exam =>
        Number(
          exam.id
        ) ===
        Number(id)
    );


  if (!exam) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/exams/${id}`,
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
                exam.subject,

              title:
                exam.title,

              exam_date:
                formatDateForInput(
                  exam.exam_date
                ),

              exam_time:
                formatTimeForInput(
                  exam.exam_time
                ) ||
                null,

              location:
                exam.location ||
                "",

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
        "Could not complete exam."
      );


      return;
    }


    await loadExams();

  } catch (error) {

    console.error(
      "Error completing exam:",
      error
    );
  }
}


// ==========================
// DELETE EXAM
// ==========================

async function deleteExam(id) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this exam?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/exams/${id}`,
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
        "Could not delete exam."
      );


      return;
    }


    await loadExams();

  } catch (error) {

    console.error(
      "Error deleting exam:",
      error
    );
  }
}


// ==========================
// SEARCH EVENTS
// ==========================

examSearch.addEventListener(
  "input",
  renderExams
);


examFilter.addEventListener(
  "change",
  renderExams
);


// ==========================
// RENDER EXAMS
// ==========================

function renderExams() {

  const searchValue =
    examSearch.value
      .trim()
      .toLowerCase();


  const filterValue =
    examFilter.value;


  let filteredExams =
    [...exams];


  // ======================
  // SEARCH
  // ======================

  if (searchValue) {

    filteredExams =
      filteredExams.filter(
        exam => {

          const subject =
            String(
              exam.subject ||
              ""
            )
              .toLowerCase();


          const title =
            String(
              exam.title ||
              ""
            )
              .toLowerCase();


          const location =
            String(
              exam.location ||
              ""
            )
              .toLowerCase();


          return (
            subject.includes(
              searchValue
            )
            ||
            title.includes(
              searchValue
            )
            ||
            location.includes(
              searchValue
            )
          );
        }
      );
  }


  // ======================
  // FILTER
  // ======================

  if (
    filterValue ===
    "upcoming"
  ) {

    filteredExams =
      filteredExams.filter(
        exam =>
          exam.status ===
          "upcoming"
      );
  }


  else if (
    filterValue ===
    "completed"
  ) {

    filteredExams =
      filteredExams.filter(
        exam =>
          exam.status ===
          "completed"
      );
  }


  else if (
    filterValue ===
    "today"
  ) {

    filteredExams =
      filteredExams.filter(
        exam =>
          isExamToday(exam)
      );
  }


  // ======================
  // SORT
  // ======================

  filteredExams.sort(
    (a, b) => {

      if (
        a.status !==
        b.status
      ) {

        if (
          a.status ===
          "upcoming"
        ) {

          return -1;
        }


        if (
          b.status ===
          "upcoming"
        ) {

          return 1;
        }
      }


      return (
        parseDateOnly(
          a.exam_date
        )
        -
        parseDateOnly(
          b.exam_date
        )
      );
    }
  );


  resultSummary.textContent =
    `Showing ${filteredExams.length} of ${exams.length} exams`;


  if (
    filteredExams.length ===
    0
  ) {

    examList.innerHTML = `

      <div class="empty-state">

        <p>
          No exams found.
        </p>

        <span>
          Try changing your search or filter.
        </span>

      </div>

    `;


    updateStatistics();


    return;
  }


  examList.innerHTML =
    filteredExams
      .map(
        exam =>
          createExamHTML(
            exam
          )
      )
      .join("");


  updateStatistics();
}


// ==========================
// CREATE EXAM HTML
// ==========================

function createExamHTML(exam) {

  const today =
    isExamToday(exam);


  let itemClass =
    "exam-item";


  if (
    exam.status ===
    "completed"
  ) {

    itemClass +=
      " completed-exam";
  }


  else if (today) {

    itemClass +=
      " today-exam";
  }


  return `

    <div class="${itemClass}">

      <div class="exam-info">

        <div class="exam-subject">

          ${escapeHTML(
            exam.subject
          )}

        </div>


        <h3>

          ${escapeHTML(
            exam.title
          )}

        </h3>


        <div class="exam-details">

          <span>

            📅
            ${formatDate(
              exam.exam_date
            )}

          </span>


          ${
            exam.exam_time
              ? `

                <span>

                  🕐
                  ${formatTime(
                    exam.exam_time
                  )}

                </span>

              `
              : ""
          }


          <span>

            📍
            ${escapeHTML(
              exam.location ||
              "Location not specified"
            )}

          </span>

        </div>


        <div class="exam-badges">

          <span
            class="badge ${exam.status}"
          >

            ${escapeHTML(
              exam.status
            )}

          </span>


          ${
            today &&
            exam.status ===
            "upcoming"

              ? `

                <span
                  class="badge today"
                >
                  Today
                </span>

              `

              : ""
          }

        </div>

      </div>


      <div class="exam-actions">

        <button
          type="button"
          title="Edit exam"
          onclick="editExam(${exam.id})"
        >
          ✏️
        </button>


        ${
          exam.status ===
          "upcoming"

            ? `

              <button
                type="button"
                class="complete-btn"
                title="Mark completed"
                onclick="completeExam(${exam.id})"
              >
                ✓
              </button>

            `

            : ""
        }


        <button
          type="button"
          class="delete-btn"
          title="Delete exam"
          onclick="deleteExam(${exam.id})"
        >
          🗑
        </button>

      </div>

    </div>

  `;
}


// ==========================
// EXAM TODAY
// ==========================

function isExamToday(exam) {

  if (
    !exam.exam_date
  ) {

    return false;
  }


  const examDate =
    parseDateOnly(
      exam.exam_date
    );


  const today =
    getTodayDate();


  return (

    examDate.getFullYear() ===
      today.getFullYear()

    &&

    examDate.getMonth() ===
      today.getMonth()

    &&

    examDate.getDate() ===
      today.getDate()

  );
}


// ==========================
// STATISTICS
// ==========================

function updateStatistics() {

  const upcoming =
    exams.filter(
      exam =>
        exam.status ===
        "upcoming"
    ).length;


  const completed =
    exams.filter(
      exam =>
        exam.status ===
        "completed"
    ).length;


  const today =
    exams.filter(
      exam =>
        isExamToday(exam)
        &&
        exam.status ===
        "upcoming"
    ).length;


  document
    .getElementById(
      "totalExams"
    )
    .textContent =
    exams.length;


  document
    .getElementById(
      "upcomingExams"
    )
    .textContent =
    upcoming;


  document
    .getElementById(
      "completedExams"
    )
    .textContent =
    completed;


  document
    .getElementById(
      "todayExams"
    )
    .textContent =
    today;
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


function formatDateForInput(value) {

  if (!value) {
    return "";
  }


  return String(
    value
  ).slice(
    0,
    10
  );
}


// ==========================
// TIME HELPERS
// ==========================

function formatTime(value) {

  if (!value) {
    return "";
  }


  const time =
    String(value)
      .slice(
        0,
        5
      );


  const parts =
    time.split(
      ":"
    );


  if (
    parts.length < 2
  ) {

    return time;
  }


  let hours =
    Number(
      parts[0]
    );


  const minutes =
    parts[1];


  const suffix =
    hours >= 12
      ? "PM"
      : "AM";


  hours =
    hours % 12;


  if (
    hours === 0
  ) {

    hours =
      12;
  }


  return (
    hours +
    ":" +
    minutes +
    " " +
    suffix
  );
}


function formatTimeForInput(value) {

  if (!value) {
    return "";
  }


  return String(value)
    .slice(
      0,
      5
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

startExamsPage();