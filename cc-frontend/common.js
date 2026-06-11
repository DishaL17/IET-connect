// ---------------- GLOBAL DATA STORE ----------------
let dbItems = []; // Populated from database on page load

// ---------------- DETECT CURRENT PAGE TYPE ----------------
function getPageType() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("lost.html")) return "lost";
  if (path.includes("found.html")) return "found";
  if (path.includes("sell.html")) return "sell";
  if (path.includes("rent.html")) return "rent";
  return null;
}
/*
// ---------------- FETCH AND RENDER ITEMS ----------------
async function loadPageItems() {
  const type = getPageType();
  if (!type) return;

  const itemsContainer = document.querySelector(".items");
  if (!itemsContainer) {
    console.error("No .items container found on this page.");
    return;
  }

  try {
    // Fetch items of the specific type for this page
    const res = await fetch(`http://localhost:5000/api/items?type=${type}`);
    const items = await res.json();
    
    // Clear the placeholder/hardcoded items
    itemsContainer.innerHTML = "";

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="no-items" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888; font-size: 1.1rem;">
          📭 No items posted under this category yet.
        </div>
      `;
      return;
    }

    items.forEach(item => {
      // Setup display variables based on page type
      let locationText = "";
      let timeOrPriceText = "";
      let buttonText = "";

      if (type === "lost") {
        locationText = `Last seen: ${item.location || "Unknown"}`;
        timeOrPriceText = item.createdAt ? formatDate(item.createdAt) : "Recently";
        buttonText = "I found it!";
      } else if (type === "found") {
        locationText = `Last seen: ${item.location || "Unknown"}`;
        timeOrPriceText = item.createdAt ? formatDate(item.createdAt) : "Recently";
        buttonText = "Contact Founder";
      } else if (type === "sell") {
        locationText = `Seller: ${item.location || "Campus Member"}`;
        timeOrPriceText = item.price || "Free";
        buttonText = "View details";
      } else if (type === "rent") {
        locationText = `Owner: ${item.location || "Campus Member"}`;
        timeOrPriceText = item.price || "Free";
        buttonText = "Enquire";
      }

      // Default placeholder image based on category if none uploaded
      let placeholderImg = "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop"; 
      if (item.category && item.category.toLowerCase() === "phone") {
        placeholderImg = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop";
      } else if (item.category && item.category.toLowerCase() === "keys") {
        placeholderImg = "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=300&auto=format&fit=crop";
      } else if (item.category && item.category.toLowerCase() === "wallet") {
        placeholderImg = "https://images.unsplash.com/photo-1627124765135-565707ed47af?q=80&w=300&auto=format&fit=crop";
      } else if (item.category && item.category.toLowerCase() === "card") {
        placeholderImg = "https://images.unsplash.com/photo-1589758438368-0ad531db3366?q=80&w=300&auto=format&fit=crop";
      }
      
      const imgSrc = item.imageUrl || placeholderImg;

      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.innerHTML = `
        <img src="${imgSrc}" alt="${item.title}" style="object-fit: cover; height: 180px; width: 100%; border-radius: 8px;">
        <span class="identity">${item.category || "Other"}</span>
        <span class="name">${item.title}</span>
        <span class="location">${locationText}</span>
        <div class="last">
          <span class="time">${timeOrPriceText}</span>
          <button class="claim" onclick="handleItemAction('${item._id}', '${type}')">${buttonText}</button>
        </div>
      `;
      itemsContainer.appendChild(itemDiv);
    });
  } catch (err) {
    console.error("Error loading items from backend:", err);
    itemsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff5c5c;">
        ⚠️ Failed to load items. Make sure your backend server is running on http://localhost:5000
      </div>
    `;
  }
}

// Helper to format date nicely
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) {
    const hours = Math.round(diffTime / (1000 * 60 * 60));
    if (hours === 0) return "Just now";
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffDays === 1) return "Yesterday";
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Dummy handler for button clicks (e.g., claiming, contacting)
function handleItemAction(itemId, type) {
  alert(`Action clicked for item ID: ${itemId} (${type} item). Next, we can connect this to chat or contact details!`);
}

// ---------------- LOAD ALL ITEMS FOR SEARCH ----------------
async function loadAllItemsForSearch() {
  try {
    const res = await fetch("http://localhost:5000/api/items");
    dbItems = await res.json();
  } catch (err) {
    console.error("Error loading search items:", err);
  }
}

// ---------------- LIVE SEARCH ----------------
window.searchItems = function() {
  const it = document.getElementById("sea").value.trim().toLowerCase();
  const result = document.getElementById("result");
  const sd = document.getElementById("searchDrop");

  result.innerHTML = "";

  if (it === "") {
    sd.style.display = "none";
    return;
  }

  // Search through database items
  const match = dbItems.filter(itm =>
    (itm.title && itm.title.toLowerCase().includes(it)) ||
    (itm.type && itm.type.toLowerCase().includes(it)) ||
    (itm.category && itm.category.toLowerCase().includes(it))
  );

  if (match.length === 0) {
    result.innerHTML = "<li>No items found</li>";
  } else {
    match.forEach(itm => {
      const li = document.createElement("li");
      li.style.cursor = "pointer";
      li.onclick = () => {
        // Redirect to the correct page for this item type
        window.location.href = `${itm.type}.html`;
      };
      li.innerHTML = `
        <span>${itm.title}</span>
        <span class="tag ${itm.type}">
          ${itm.type}
        </span>
      `;
      result.appendChild(li);
    });
  }

  sd.style.display = "block";
}

// Close search dropdown on click outside
document.addEventListener("click", (e) => {
  const sd = document.getElementById("searchDrop");
  const searchInput = document.getElementById("sea");
  if (sd && e.target !== searchInput && !sd.contains(e.target)) {
    sd.style.display = "none";
  }
});

// ---------------- INITIALIZATION ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadPageItems();
  loadAllItemsForSearch();
  setupProfileDropdown();
  updateNotificationBadge();
});

// ---------------- DYNAMIC PROFILE DROPDOWN ----------------
function setupProfileDropdown() {
  const userChip = document.querySelector(".user-chip");
  if (!userChip) return;

  // Make sure userChip is set up for dropdown positioning
  userChip.style.position = "relative";
  userChip.style.cursor = "pointer";
  userChip.id = "userChip";

  // Create the dropdown menu
  const dropdown = document.createElement("div");
  dropdown.id = "profileDropdown";
  dropdown.className = "profile-dropdown";
  dropdown.style.display = "none";
  
  // Extract name and initials
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

  // Toggle on click
  userChip.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "flex" : "none";
    }
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target !== userChip && !userChip.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
}

// ---------------- NOTIFICATION BADGE SYSTEM ----------------
window.updateNotificationBadge = function() {
  const defaultNotifications = [
    { id: 1, sender: "Aman Sharma", avatar: "AS", message: "sent you an enquiry about your Casio Calculator.", time: "2 hours ago", unread: true },
    { id: 2, sender: "Priya Patel", avatar: "PP", message: "marked your lost keys as found near canteen.", time: "Yesterday", unread: true },
    { id: 3, sender: "GDG Club", avatar: "GD", message: "posted a new tech workshop announcement.", time: "3 days ago", unread: true }
  ];

  let notifications = JSON.parse(localStorage.getItem("campus_notifications"));
  if (!notifications) {
    notifications = defaultNotifications;
    localStorage.setItem("campus_notifications", JSON.stringify(notifications));
  }

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
*/