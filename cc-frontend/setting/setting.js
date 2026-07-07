document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");

  const res = await fetch(
    `${window.API_BASE_URL}/api/profile/${userId}`
  );

  const user = await res.json();

  document.getElementById("name").value = user.name || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("phone").value = user.phone_no || "";
  document.getElementById("dept").value = user.branch || "";
  document.getElementById("bio").value = user.bio || "";
});
const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");

  const payload = {
    bio: document.getElementById("bio").value,
    branch: document.getElementById("dept").value,
    phone_no: document.getElementById("phone").value
  };

  const res = await fetch(
    `${window.API_BASE_URL}/api/profile/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await res.json();

  alert("Profile Updated Successfully!");

  console.log(data);
});
