let user = null;


// ==========================
// ELEMENTS
// ==========================

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const logoutProfileButton =
  document.getElementById(
    "logoutProfileButton"
  );


const profileForm =
  document.getElementById(
    "profileForm"
  );


const passwordForm =
  document.getElementById(
    "passwordForm"
  );


const profileName =
  document.getElementById(
    "profileName"
  );


const profileEmail =
  document.getElementById(
    "profileEmail"
  );


const profileDisplayName =
  document.getElementById(
    "profileDisplayName"
  );


const profileDisplayEmail =
  document.getElementById(
    "profileDisplayEmail"
  );


const profileAvatar =
  document.getElementById(
    "profileAvatar"
  );


const memberSince =
  document.getElementById(
    "memberSince"
  );


const profileMessage =
  document.getElementById(
    "profileMessage"
  );


const passwordMessage =
  document.getElementById(
    "passwordMessage"
  );


const saveProfileButton =
  document.getElementById(
    "saveProfileButton"
  );


const changePasswordButton =
  document.getElementById(
    "changePasswordButton"
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
// START PAGE
// ==========================

async function startProfilePage() {

  const loggedIn =
    await loadSession();


  if (!loggedIn) {
    return;
  }


  await loadProfile();
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
// LOAD PROFILE
// ==========================

async function loadProfile() {

  try {

    const response =
      await fetch(
        `/api/profile/${user.id}`
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

      showMessage(
        profileMessage,
        data.message ||
        "Could not load profile.",
        "error"
      );


      return;
    }


    updateProfileUI(
      data
    );

  } catch (error) {

    console.error(
      "Profile loading error:",
      error
    );


    showMessage(
      profileMessage,
      "Could not load profile.",
      "error"
    );
  }
}


// ==========================
// UPDATE UI
// ==========================

function updateProfileUI(
  profile
) {

  profileName.value =
    profile.name ||
    "";


  profileEmail.value =
    profile.email ||
    "";


  profileDisplayName.textContent =
    profile.name ||
    "Student";


  profileDisplayEmail.textContent =
    profile.email ||
    "";


  memberSince.textContent =
    formatDate(
      profile.created_at
    );


  const initial =
    String(
      profile.name ||
      "S"
    )
      .trim()
      .charAt(0)
      .toUpperCase();


  profileAvatar.textContent =
    initial ||
    "S";


  user.name =
    profile.name;


  user.email =
    profile.email;
}


// ==========================
// SAVE PROFILE
// ==========================

profileForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    hideMessage(
      profileMessage
    );


    const name =
      profileName.value
        .trim();


    const email =
      profileEmail.value
        .trim();


    if (
      !name ||
      !email
    ) {

      showMessage(
        profileMessage,
        "Name and email are required.",
        "error"
      );


      return;
    }


    saveProfileButton.disabled =
      true;


    saveProfileButton.textContent =
      "Saving...";


    try {

      const response =
        await fetch(
          `/api/profile/${user.id}`,
          {

            method:
              "PUT",


            headers: {

              "Content-Type":
                "application/json"

            },


            body:
              JSON.stringify({

                name,

                email

              })

          }
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

        showMessage(
          profileMessage,
          data.message ||
          "Could not update profile.",
          "error"
        );


        return;
      }


      showMessage(
        profileMessage,
        data.message ||
        "Profile updated successfully.",
        "success"
      );


      await loadProfile();

    } catch (error) {

      console.error(
        "Profile update error:",
        error
      );


      showMessage(
        profileMessage,
        "Could not update profile.",
        "error"
      );

    } finally {

      saveProfileButton.disabled =
        false;


      saveProfileButton.textContent =
        "Save Changes";
    }
  }
);


// ==========================
// CHANGE PASSWORD
// ==========================

passwordForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    hideMessage(
      passwordMessage
    );


    const currentPassword =
      document
        .getElementById(
          "currentPassword"
        )
        .value;


    const newPassword =
      document
        .getElementById(
          "newPassword"
        )
        .value;


    const confirmPassword =
      document
        .getElementById(
          "confirmPassword"
        )
        .value;


    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      showMessage(
        passwordMessage,
        "Please complete all password fields.",
        "error"
      );


      return;
    }


    if (
      newPassword.length <
      6
    ) {

      showMessage(
        passwordMessage,
        "New password must contain at least 6 characters.",
        "error"
      );


      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {

      showMessage(
        passwordMessage,
        "New passwords do not match.",
        "error"
      );


      return;
    }


    changePasswordButton.disabled =
      true;


    changePasswordButton.textContent =
      "Updating...";


    try {

      const response =
        await fetch(
          `/api/profile/${user.id}/password`,
          {

            method:
              "PUT",


            headers: {

              "Content-Type":
                "application/json"

            },


            body:
              JSON.stringify({

                currentPassword,

                newPassword

              })

          }
        );


      if (
        response.status ===
        401
      ) {

        /*
          A 401 here may mean either:
          - session expired
          - current password incorrect

          We read the backend response
          before deciding what to display.
        */
      }


      const data =
        await response.json();


      if (!response.ok) {

        showMessage(
          passwordMessage,
          data.message ||
          "Could not change password.",
          "error"
        );


        return;
      }


      showMessage(
        passwordMessage,
        data.message ||
        "Password changed successfully.",
        "success"
      );


      passwordForm.reset();

    } catch (error) {

      console.error(
        "Password update error:",
        error
      );


      showMessage(
        passwordMessage,
        "Could not change password.",
        "error"
      );

    } finally {

      changePasswordButton.disabled =
        false;


      changePasswordButton.textContent =
        "Change Password";
    }
  }
);


// ==========================
// LOGOUT
// ==========================

logoutButton.addEventListener(
  "click",
  logout
);


logoutProfileButton.addEventListener(
  "click",
  logout
);


async function logout() {

  try {

    await fetch(
      "/api/logout",
      {
        method:
          "POST"
      }
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );
  }


  window.location.href =
    "/login.html";
}


// ==========================
// MESSAGE HELPERS
// ==========================

function showMessage(
  element,
  message,
  type
) {

  element.textContent =
    message;


  element.className =
    `form-message show ${type}`;
}


function hideMessage(
  element
) {

  element.textContent =
    "";


  element.className =
    "form-message";
}


// ==========================
// DATE
// ==========================

function formatDate(
  value
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";
  }


  return date.toLocaleDateString(
    undefined,
    {

      year:
        "numeric",

      month:
        "long",

      day:
        "numeric"

    }
  );
}


// ==========================
// START
// ==========================

startProfilePage();