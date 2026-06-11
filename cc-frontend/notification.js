document.addEventListener("DOMContentLoaded", () => {
  loadNotifications();
  setupProfileDropdown(); // Support topbar chip dropdown
  updateNotificationBadge(); // Sync global notification badge
});

const defaultNotifications = [
  { id: 1, sender: "Aman Sharma", avatar: "AS", message: "sent you an enquiry about your Casio Calculator.", time: "2 hours ago", unread: true },
  { id: 2, sender: "Priya Patel", avatar: "PP", message: "marked your lost keys as found near canteen.", time: "Yesterday", unread: true },
  { id: 3, sender: "GDG Club", avatar: "GD", message: "posted a new tech workshop announcement.", time: "3 days ago", unread: true }
];

function loadNotifications() {
  const container = document.querySelector(".noti");
  if (!container) return;

  // Fetch notifications from localStorage
  let notifications = JSON.parse(localStorage.getItem("campus_notifications"));
  if (!notifications) {
    notifications = defaultNotifications;
    localStorage.setItem("campus_notifications", JSON.stringify(notifications));
  }

  // Clear existing items but preserve title header and actions
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 8px;">
      <span class="Notifications">Notifications</span>
      <div style="display: flex; gap: 10px;">
        <button id="markAllBtn" class="noti-btn" onclick="markAllRead()" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border: 1.5px solid #2f7e78; border-radius: 8px; background: #e0f7f5; color: #2f7e78; cursor: pointer; transition: all 0.2s;">Mark all as read</button>
        <button id="clearAllBtn" class="noti-btn" onclick="clearAllNotifications()" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border: 1.5px solid #b40b0b; border-radius: 8px; background: #fdeaea; color: #b40b0b; cursor: pointer; transition: all 0.2s;">Clear all</button>
      </div>
    </div>
  `;

  if (notifications.length === 0) {
    container.innerHTML += `
      <div style="text-align: center; padding: 50px; color: #64748b;">
        <div style="font-size: 32px; margin-bottom: 10px;">📭</div>
        <div style="font-weight: 700; font-size: 16px;">All caught up!</div>
        <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">You have no new notifications.</div>
      </div>
    `;
    return;
  }

  notifications.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "m";
    itemDiv.onclick = () => toggleReadStatus(item.id);
    
    // Add custom styling for unread background
    if (item.unread) {
      itemDiv.style.background = "#e0f7f5";
      itemDiv.style.borderLeft = "4px solid #2f7e78";
    } else {
      itemDiv.style.background = "#f8fafc";
      itemDiv.style.borderLeft = "4px solid transparent";
    }

    const unreadIndicator = item.unread ? `<span style="background: #2f7e78; color: white; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-left: 8px;"></span>` : '';

    itemDiv.innerHTML = `
      <div class="ic">${item.avatar || "👤"}</div>
      <div class="h">
        <div class="me">
          <span class="n">${item.sender}</span>
          <span class="time">${item.time}</span>
        </div>
        <div class="c">
          <span class="e" style="font-weight: ${item.unread ? '700' : '400'}; color: ${item.unread ? '#1e293b' : '#64748b'};">${item.message}</span>
          ${unreadIndicator}
        </div>
      </div>
    `;
    container.appendChild(itemDiv);
  });
}

window.toggleReadStatus = function(id) {
  let notifications = JSON.parse(localStorage.getItem("campus_notifications"));
  if (!notifications) return;

  notifications = notifications.map(n => {
    if (n.id === id) {
      n.unread = false; // Mark as read
    }
    return n;
  });

  localStorage.setItem("campus_notifications", JSON.stringify(notifications));
  loadNotifications();
  updateNotificationBadge();
};

window.markAllRead = function() {
  let notifications = JSON.parse(localStorage.getItem("campus_notifications"));
  if (!notifications) return;

  notifications = notifications.map(n => {
    n.unread = false;
    return n;
  });

  localStorage.setItem("campus_notifications", JSON.stringify(notifications));
  loadNotifications();
  updateNotificationBadge();
};

window.clearAllNotifications = function() {
  if (!confirm("Are you sure you want to clear all notifications?")) return;
  localStorage.setItem("campus_notifications", JSON.stringify([]));
  loadNotifications();
  updateNotificationBadge();
};

// ---------------- DYNAMIC PROFILE DROPDOWN ----------------
function setupProfileDropdown() {
  const userChip = document.querySelector(".user-chip");
  if (!userChip) return;

  userChip.style.position = "relative";
  userChip.style.cursor = "pointer";
  userChip.id = "userChip";

  const dropdown = document.createElement("div");
  dropdown.id = "profileDropdown";
  dropdown.className = "profile-dropdown";
  dropdown.style.display = "none";
  
  const usernameSpan = userChip.querySelector(".username");
  const avatarDiv = userChip.querySelector(".avatar");
  
  const fullname = usernameSpan ? usernameSpan.textContent.trim() : "Disha Lowanshi";
  const initials = avatarDiv ? avatarDiv.textContent.trim() : "DL";
  const email = fullname.toLowerCase().replace(/\s+/g, ".") + "@college.edu";

  dropdown.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${initials}</div>
      <div class="profile-info">
        <div class="profile-name">${fullname}</div>
        <div class="profile-email">${email}</div>
      </div>
    </div>
    <hr class="dropdown-divider">
    <a href="post.html" class="dropdown-item"><span>📋</span> My Posts</a>
    <a href="setthing.html" class="dropdown-item"><span>⚙️</span> Settings</a>
    <hr class="dropdown-divider">
    <a href="loginpage.html" class="dropdown-item logout-item"><span>🚪</span> Logout</a>
  `;

  userChip.appendChild(dropdown);

  userChip.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "flex" : "none";
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target !== userChip && !userChip.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
}

// ---------------- NOTIFICATION BADGE SYSTEM ----------------
window.updateNotificationBadge = function() {
  let notifications = JSON.parse(localStorage.getItem("campus_notifications"));
  if (!notifications) return;

  const unreadCount = notifications.filter(n => n.unread).length;
  
  // Find all notification badges in nav links
  const badges = document.querySelectorAll(".badge");
  badges.forEach(badge => {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = "flex"; // Ensure visible
    } else {
      badge.style.display = "none"; // Hide if zero
    }
  });
}
