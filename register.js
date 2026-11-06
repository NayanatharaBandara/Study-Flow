const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword =
    document.getElementById("confirmPassword").value;

  message.textContent = "";

  if (!name || !email || !password || !confirmPassword) {
    message.textContent = "Please fill in all fields.";
    return;
  }

  if (password.length < 6) {
    message.textContent =
      "Password must be at least 6 characters.";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent =
      "Passwords do not match.";
    return;
  }

  try {

    const response = await fetch("/api/register", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name: name,
        email: email,
        password: password
      })
    });

    const data = await response.json();

    message.textContent = data.message;

    if (response.ok) {

      registerForm.reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);

    }

  } catch (error) {

    console.error(error);

    message.textContent =
      "Could not connect to the server.";
  }

});