async function searchItems() {
    const query = document.getElementById("sea").value.trim();
    const resultBox = document.getElementById("result");
    const drop = document.getElementById("searchDrop");
    if (!query) {
        drop.style.display = "none";
        resultBox.innerHTML = "";
        return;
    }
    try {
        const res = await fetch("http://localhost:5000/api/items");
        const data = await res.json();

        // filter results
        const filtered = data.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
        );

        // show dropdown
        drop.style.display = "block";

        // clear old results
        resultBox.innerHTML = "";

        // no results
        if (filtered.length === 0) {
            resultBox.innerHTML = "<li>No results found</li>";
            return;
        }

        // render results
        filtered.slice(0, 5).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.title;

            // click on result
            li.onclick = () => {
                document.getElementById("sea").value = item.title;
                drop.style.display = "none";
            };

            resultBox.appendChild(li);
        });

    } catch (error) {
        console.error("Search error:", error);
    }
}

// Global startChat helper to redirect to chats page with correct active recipient
window.startChat = function(ownerId, ownerName) {
  const currentUserId = localStorage.getItem("userId");
  if (!currentUserId) {
    alert("Please log in to chat with the owner.");
    window.location.href = "loginpage.html";
    return;
  }
  
  if (currentUserId === ownerId) {
    alert("This is your own listing!");
    return;
  }
  
  localStorage.setItem("activeChatUserId", ownerId);
  localStorage.setItem("activeChatUsername", ownerName || "Item Owner");
  window.location.href = "notification.html";
};

window.updateNotificationBadge = function() {
  // Safe no-op to prevent ReferenceError
};
document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
 
  // Fetch and display user profile details
  try {
    const res = await fetch(`http://localhost:5000/api/profile/${userId}`);
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
});


// ---------------- GLOBAL DATA STORE ----------------

/*
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



// ---------------- INITIALIZATION ----------------
document.addEventListener("DOMContentLoaded", () => {
  if (typeof loadPageItems === "function") {
    loadPageItems();
  }
  if (typeof loadAllItemsForSearch === "function") {
    loadAllItemsForSearch();
  }
  setupProfileDropdown();
  updateNotificationBadge();

  // Highlight active nav link based on current page
  const path = window.location.pathname;
  const pageName = path.substring(path.lastIndexOf("/") + 1).toLowerCase();
  
  const navLinks = document.querySelectorAll(".nav-link");
  const homePages = ["home.html", "lost.html", "found.html", "sell.html", "rent.html", ""];
  
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href) {
      const linkPageName = href.toLowerCase();
      
      let isMatch = false;
      if (linkPageName === "home.html") {
        isMatch = homePages.includes(pageName) || pageName === "index.html";
      } else {
        isMatch = (pageName === linkPageName);
      }
      
      if (isMatch) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  });
});



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