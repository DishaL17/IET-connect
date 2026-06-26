document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncements();
  loadClubs();
});

async function loadAnnouncements() {
  const container = document.getElementById("announcementList");

  try {
    const res = await fetch(
      "http://localhost:5000/api/announcements"
    );

    const announcements = await res.json();

    container.innerHTML = "";

    announcements.forEach(item => {
      const card = document.createElement("div");
      card.className = "a";

      card.innerHTML = `
        <div class="k">
          <span class="club">${item.clubName}</span>
          <span class="t">${item.title}</span>
          <span class="venue">
            ${item.venue || "Campus"}
          </span>
        </div>

        <div class="time">
          <span>
            <i class="fa-regular fa-calendar"></i>
            ${item.date ? new Date(item.date).toLocaleDateString() : ""}
          </span>

          ${item.time ? `
            <span>
              <i class="fa-regular fa-clock"></i>
              ${item.time}
            </span>
          ` : ""}
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error(error);
  }
}

async function loadClubs() {
  const clubList = document.getElementById("clubList");
  const pendingList = document.getElementById("pendingClubList");
  const adminSection = document.getElementById("adminClubsSection");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("userId");

  try {
    const res = await fetch("http://localhost:5000/api/clubs", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const clubs = await res.json();

    clubList.innerHTML = "";
    if (pendingList) pendingList.innerHTML = "";
    if (adminSection) adminSection.style.display = "none";

    let hasPending = false;
    let canPublish = (role === "admin");

    clubs.forEach(club => {
      // Check if user is the admin of this approved club
      if (club.status === "approved" && club.clubAdmin && club.clubAdmin.toString() === currentUserId) {
        canPublish = true;
      }

      if (club.status === "pending") {
        if (role === "admin") {
          hasPending = true;
          const div = document.createElement("div");
          div.className = "cn-pending";
          div.style.cssText = "display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 12px; background: #fffbeb; border: 1.5px solid #a26b2d; text-align: left;";
          div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: #a26b2d; font-size: 15px;">${club.clubName}</span>
              <span style="font-size: 10px; background: #fef3c7; color: #a26b2d; padding: 2px 6px; border-radius: 8px; font-weight: 800; text-transform: uppercase;">Pending</span>
            </div>
            <div style="font-size: 12px; color: var(--text); opacity: 0.85;">Head: ${club.headName} (${club.foundedYear})</div>
            <div style="font-size: 11px; color: var(--muted); line-height: 1.4;">${club.description}</div>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button class="approve-btn" style="flex: 1; padding: 6px; border: none; border-radius: 8px; background: #1b8843; color: white; font-weight: 700; cursor: pointer; font-size: 11px;">Accept</button>
              <button class="reject-btn" style="flex: 1; padding: 6px; border: none; border-radius: 8px; background: #b40b0b; color: white; font-weight: 700; cursor: pointer; font-size: 11px;">Reject</button>
            </div>
          `;

          div.querySelector(".approve-btn").onclick = () => approveClub(club._id);
          div.querySelector(".reject-btn").onclick = () => rejectClub(club._id);

          pendingList.appendChild(div);
        } else {
          // User's own pending club request
          const div = document.createElement("div");
          div.className = "cn";
          div.style.background = "#fffbeb";
          div.style.border = "1.5px dashed #a26b2d";
          div.style.display = "flex";
          div.style.justifyContent = "space-between";
          div.style.alignItems = "center";
          div.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 2px; text-align: left;">
              <span class="c" style="font-weight: 700; color: #a26b2d;">${club.clubName}</span>
              <span style="font-size: 9px; color: #a26b2d; font-weight: 800;">PENDING APPROVAL</span>
            </div>
          `;
          div.onclick = () => {
            alert("⏳ This club is currently pending verification. You can access details once approved.");
          };
          clubList.appendChild(div);
        }
      } else {
        // Approved club
        const div = document.createElement("div");
        div.className = "cn";
        div.innerHTML = `
          <span class="c">${club.clubName}</span>
          <span class="ar">></span>
        `;
        div.addEventListener("click", () => {
          window.location.href = `club.html?id=${club._id}`;
        });
        clubList.appendChild(div);
      }
    });

    const createBtn = document.getElementById("createAnnouncementBtn");
    if (createBtn) {
      createBtn.style.display = canPublish ? "inline-block" : "none";
    }

    if (role === "admin" && hasPending && adminSection) {
      adminSection.style.display = "block";
    }

  } catch (error) {
    console.error("Error loading clubs:", error);
  }
}

async function approveClub(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure you want to approve this club application?")) return;
  try {
    const res = await fetch(`http://localhost:5000/api/clubs/${id}/approve`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (res.ok) {
      alert("🎉 Club approved successfully!");
      loadClubs();
    } else {
      const err = await res.json();
      alert(`❌ Approval failed: ${err.error || "Unknown error"}`);
    }
  } catch (e) {
    console.error(e);
    alert("❌ Server connection error.");
  }
}

async function rejectClub(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure you want to reject and delete this club application?")) return;
  try {
    const res = await fetch(`http://localhost:5000/api/clubs/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (res.ok) {
      alert("✅ Club request rejected/deleted.");
      loadClubs();
    } else {
      const err = await res.json();
      alert(`❌ Rejection failed: ${err.error || "Unknown error"}`);
    }
  } catch (e) {
    console.error(e);
    alert("❌ Server connection error.");
  }
}