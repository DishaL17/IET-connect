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
const response = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
});

const data = await response.json();
console.log(data);

window.location.href = "loginpage.html";

console.log("Response Status:", response.status);
console.log("Response Data:", data);

});