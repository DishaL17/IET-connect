const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const currentUserId = localStorage.getItem("userId");

document.addEventListener("DOMContentLoaded", async () => {
  if (!currentUserId || !token) {
    window.location.href = "loginpage.html";
    return;
  }

  await initializeForm();
});

async function initializeForm() {
  try {
    const res = await fetch("http://localhost:5000/api/clubs", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to load clubs.");
    const clubs = await res.json();

    // Find approved clubs managed by this user
    const myClubs = clubs.filter(c => c.status === "approved" && c.clubAdmin && c.clubAdmin.toString() === currentUserId);

    const isGlobalAdmin = (role === "admin");
    const isClubAdmin = (myClubs.length > 0);

    if (!isGlobalAdmin && !isClubAdmin) {
      alert("Access denied. Only approved club admins or global admins can create announcements.");
      window.location.href = "Announcment.html";
      return;
    }

    // If club admin and NOT global admin, swap the text input with a select dropdown
    if (isClubAdmin && !isGlobalAdmin) {
      const container = document.getElementById("clubNameContainer");
      if (container) {
        container.innerHTML = `
          <select id="clubName" style="padding:12px; border:1px solid #dbe2ea; border-radius:12px; outline:none; font-size:15px; width:100%; background:white; font-family:inherit;" required>
            ${myClubs.map(c => `<option value="${c.clubName}">${c.clubName}</option>`).join("")}
          </select>
        `;
      }
    }

  } catch (error) {
    console.error("Initialization error:", error);
    alert("An error occurred during page setup. Redirecting...");
    window.location.href = "Announcment.html";
  }
}

const form = document.getElementById("announcementForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    clubName: document.getElementById("clubName").value.trim(),
    title: document.getElementById("title").value.trim(),
    venue: document.getElementById("venue").value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value.trim()
  };

  try {
    const res = await fetch(
      "http://localhost:5000/api/announcements",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (res.ok) {
      document.getElementById("message").style.color = "green";
      document.getElementById("message").textContent =
        "✅ Announcement Created Successfully";

      form.reset();
    } else {
      document.getElementById("message").style.color = "red";
      document.getElementById("message").textContent =
        data.error || "Failed to create announcement";
    }

  } catch (error) {
    console.error(error);
    document.getElementById("message").style.color = "red";
    document.getElementById("message").textContent =
      "❌ Server Error";
  }
});