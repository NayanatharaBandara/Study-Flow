const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  message.textContent = "";

  try {

    const response = await fetch("/api/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    message.textContent = data.message;

    if (response.ok) {

      // No localStorage anymore
      window.location.href =
        "/dashboard.html";

    }

  } catch (error) {

    console.error(error);

    message.textContent =
      "Could not connect to the server.";

  }
});