document.addEventListener("DOMContentLoaded", () => {
  const eye = document.getElementById("eye");
  const passwordInput = document.getElementById("password");

  if (eye && passwordInput) {
    eye.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        
        eye.className = "fa-solid fa-eye-slash";
      } else {
        passwordInput.type = "password";
        eye.className = "fa-solid fa-eye";
      }
    });
  }
});

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginbtn = document.getElementById("loginbtn");

loginbtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(window.API_BASE_URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
console.log(data);
    console.log("LOGIN RESPONSE:", data);

    if (!response.ok) {
      alert(data.message);
      return;
    }

    localStorage.setItem("token", data.token);

    window.location.href = "home/home.html";

  } catch (err) {
    console.error(err);
    alert("Login failed");
  }
});