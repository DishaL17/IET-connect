document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "../loginpage.html";
    return;
  }


  try {
    const res = await fetch(`${window.API_BASE_URL}/api/profile/${userId}`);
    if (res.ok) {
      const user = await res.json();
      
      const usernameEl = document.querySelector(".user-chip .username");
      const emailEl = document.querySelector(".user-chip .user-email");
      const avatarEl = document.querySelector(".user-chip .avatar");
      
      if (usernameEl) usernameEl.textContent = user.name || "User";
      if (emailEl) emailEl.textContent = user.email || "";
      if (avatarEl && user.name) {
        avatarEl.textContent = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      }
    }
  } catch (err) {
    console.error("Error loading settings profile:", err);
  }

 
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to log out?")) {
        localStorage.clear();
        window.location.href = "../loginpage.html";
      }
    });
  }
});
