const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("Confirmpassword");
const registerBtn = document.getElementById("registerbtn");

registerbtn.addEventListener("click", async () => {
      const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!name || !email || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;}

if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;}

const userData = { name, email, password };
const response = await fetch(window.API_BASE_URL + "/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
});

const data = await response.json();
console.log(data);

if (response.ok && data.success) {
    alert("🎉 Registration successful! Please log in.");
    window.location.href = "loginpage.html";
} else {
    alert(`❌ Registration failed: ${data.message || "Unknown error"}`);
}

});