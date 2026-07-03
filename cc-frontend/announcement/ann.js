document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("announcement-list")) {
    loadLatestAnnouncementsForHome();
  }
  if (document.getElementById("announcementList")) {
    loadAnnouncements();
    loadClubs();
  }
});

async function loadLatestAnnouncementsForHome() {
  try {
    const res = await fetch("http://localhost:5000/api/announcements");
    const announcements = await res.json();
    const latest = announcements.slice(0, 3); // latest 3 only

    const container = document.getElementById("announcement-list");
    window.latestAnnouncements = latest; // Store globally for access by index

    container.innerHTML = latest.map((a, index) => {
      const postDate = a.createdAt ? new Date(a.createdAt) : (a.date ? new Date(a.date) : null);
      const isNew = postDate ? (new Date() - postDate) < 24 * 60 * 60 * 1000 : false;
      const newTag = isNew ? `<span class="new-tag">NEW</span>` : "";

      return `
        <div class="a" onclick="openAnnouncementModal(window.latestAnnouncements[${index}])" style="cursor: pointer;">
          <div class="cn">${a.clubName || "Unknown Club"}</div>

          <div class="kk">
            <span class="ak" style="display: flex; align-items: center; gap: 6px;">
              ${a.title || "No Title"}
              ${newTag}
            </span>
            <span class="venue">
              ${a.date ? new Date(a.date).toLocaleDateString() : ""}
              ${a.time ? `, ${a.time}` : ""}
              ${a.venue ? `, ${a.venue}` : ""}
            </span>
          </div>

          <div class="all">➤</div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Error loading latest announcements for home:", err);
  }
}

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
      card.style.cursor = "pointer";
      card.onclick = () => openAnnouncementModal(item);
      const postDate = item.createdAt ? new Date(item.createdAt) : (item.date ? new Date(item.date) : null);
      const isNew = postDate ? (new Date() - postDate) < 24 * 60 * 60 * 1000 : false;
      const newTag = isNew ? `<span class="new-tag" style="margin-left: 8px;">NEW</span>` : "";

      card.innerHTML = `
        <div class="k">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span class="club">${item.clubName}</span>
            ${newTag}
          </div>
          <span class="t">${item.title}</span>
        
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

    if (role === "admin") {
      await loadPendingStudents();
      const hasPendingStudents = document.getElementById("pendingStudentsList") && document.getElementById("pendingStudentsList").children.length > 0;
      if ((hasPending || hasPendingStudents) && adminSection) {
        adminSection.style.display = "block";
      }
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
// --- Announcement Modal helper functions ---
window.openAnnouncementModal = function(ann) {
  const modal = document.getElementById("announcementModal");
  if (!modal) return;

  const clubName = ann.clubName || "Unknown Club";
    
  document.getElementById("modalClubName").textContent = clubName;
  document.getElementById("modalTitle").textContent = ann.title || "No Title";
  document.getElementById("modalDesc").textContent = ann.description || "No further details provided.";
  
  const dateStr = ann.date ? new Date(ann.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "N/A";
  document.getElementById("modalDate").textContent = dateStr;
  
  const timePara = document.getElementById("modalTimePara");
  if (ann.time) {
    document.getElementById("modalTime").textContent = ann.time;
    timePara.style.display = "block";
  } else {
    timePara.style.display = "none";
  }
  
  document.getElementById("modalVenue").textContent = ann.venue || "Campus";

  modal.style.display = "flex";
};

window.closeAnnouncementModal = function() {
  const modal = document.getElementById("announcementModal");
  if (modal) {
    modal.style.display = "none";
  }
};

window.onclick = function(e) {
  const annModal = document.getElementById("announcementModal");
  if (e.target === annModal) {
    closeAnnouncementModal();
  }
};

async function loadPendingStudents() {
  const role = localStorage.getItem("role");
  if (role !== "admin") return;

  const pendingStudentsList = document.getElementById("pendingStudentsList");
  const pendingStudentsWrapper = document.getElementById("pendingStudentsWrapper");
  if (!pendingStudentsList) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:5000/api/admin/pending-verifications", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to load pending students");
    const users = await res.json();

    pendingStudentsList.innerHTML = "";

    if (users.length === 0) {
      pendingStudentsWrapper.style.display = "none";
      return;
    }

    pendingStudentsWrapper.style.display = "block";

    users.forEach(user => {
      const div = document.createElement("div");
      div.style.cssText = "display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 12px; background: #e0f7f5; border: 1.5px solid var(--teal); text-align: left; margin-bottom: 8px;";
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: var(--teal-dark); font-size: 15px;">${user.name}</span>
          <span style="font-size: 10px; background: var(--teal-lt); color: var(--teal-dark); padding: 2px 6px; border-radius: 8px; font-weight: 800; text-transform: uppercase;">Pending</span>
        </div>
        <div style="font-size: 12px; color: var(--text); opacity: 0.85;">Email: ${user.email}</div>
        <div style="font-size: 12px; color: var(--text); opacity: 0.85; font-weight: 700;">Roll Number: ${user.rollNumber || "N/A"}</div>
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button class="approve-student-btn" style="flex: 1; padding: 6px; border: none; border-radius: 8px; background: #1b8843; color: white; font-weight: 700; cursor: pointer; font-size: 11px;">Verify</button>
          <button class="reject-student-btn" style="flex: 1; padding: 6px; border: none; border-radius: 8px; background: #b40b0b; color: white; font-weight: 700; cursor: pointer; font-size: 11px;">Reject</button>
        </div>
      `;

      div.querySelector(".approve-student-btn").onclick = () => approveStudent(user._id);
      div.querySelector(".reject-student-btn").onclick = () => rejectStudent(user._id);

      pendingStudentsList.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading pending students:", err);
  }
}

async function approveStudent(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure you want to verify this student?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/admin/approve-student/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("✅ Student verified successfully!");
      loadPendingStudents();
    } else {
      const err = await res.json();
      alert(`❌ Verification failed: ${err.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function rejectStudent(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure you want to reject this student verification request?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/admin/reject-student/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("❌ Student verification request rejected.");
      loadPendingStudents();
    } else {
      const err = await res.json();
      alert(`❌ Rejection failed: ${err.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error(err);
  }
}