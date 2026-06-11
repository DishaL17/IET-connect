document.addEventListener("DOMContentLoaded", () => {
  const eye = document.getElementById("eye");
  const passwordInput = document.getElementById("password");

  if (eye && passwordInput) {
    eye.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        // Support FontAwesome class toggling if loaded
        eye.className = "fa-solid fa-eye-slash";
      } else {
        passwordInput.type = "password";
        eye.className = "fa-solid fa-eye";
      }
    });
  }
});
