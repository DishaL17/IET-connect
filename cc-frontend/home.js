async function loadLatestAnnouncements() {
  try {
    const res = await fetch("http://localhost:5000/api/announcements");
    const announcements = await res.json();

    const latest = announcements.slice(0, 3); // latest 3 only

    const container = document.getElementById("announcement-list");

    container.innerHTML = latest.map(a => `
      <div class="a">
        <div class="cn">${a.clubName || "Unknown Club"}</div>

        <div class="kk">
          <span class="ak">${a.title || "No Title"}</span>
          <span class="venue">
            ${a.date ? new Date(a.date).toLocaleDateString() : ""}
            ${a.time ? `, ${a.time}` : ""}
            ${a.venue ? `, ${a.venue}` : ""}
          </span>
        </div>

        <div class="all">➤</div>
      </div>
    `).join("");

  } catch (err) {
    console.error("Error loading announcements:", err);
  }
}

loadLatestAnnouncements();

loadLatestAnnouncements();
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return `${Math.floor(seconds / 86400)}d ago`;
}

let allActivities = [];

// 1. Fetch activities from API
async function loadActivities() {
    try {
        const res = await fetch("http://localhost:5000/api/items"); 
        const data = await res.json();

        // convert into activity format
        allActivities = data.slice(0, 20).map(item => ({
            id: item.id,
            text: item.title,
            time: new Date().toISOString()
        }));

        renderRecent();
        renderAll();

    } catch (error) {
        console.error("Error loading activities:", error);
    }
}
function renderRecent() {
    const recentList = document.getElementById("recentList");
    recentList.innerHTML = "";

    const recent = allActivities.slice(0, 5);

    recent.forEach((act, index) => {
        const li = document.createElement("li");
        li.className = "act-item";

        li.innerHTML = `
            <div class="act-left">
                <span class="act-number">${index + 1}</span>
                <div>
                    <div class="act-text">${act.text}</div>
                    <div class="act-time">🕒 ${timeAgo(act.time)}</div>
                </div>
            </div>
        `;

        recentList.appendChild(li);
    });
}
function renderAll() {
    const allList = document.getElementById("allList");
    allList.innerHTML = "";

    allActivities.forEach((act, index) => {
       console.log(index);
        const li = document.createElement("li");
        li.className = "act-item";

        li.innerHTML = `
            <div class="act-left">
                <span class="act-number">${index + 1}</span>
                <div>
                    <div class="act-text">${act.text}</div>
                <div class="act-time">🕒 ${timeAgo(act.time)}</div>
                </div>
            </div>
        `;

        allList.appendChild(li);
    });
}
function showAll() {
    document.getElementById("recentSection").style.display = "none";
    document.getElementById("allPage").style.display = "block";
}
function goBack() {
    document.getElementById("allPage").style.display = "none";
    document.getElementById("recentSection").style.display = "block";
}
window.onload = loadActivities;

// ---------------- GET ITEMS (Existing) ---------------- // Populated for search functionality



/*

async function loadActivities() {
  try {
    console.log("🚀 loadActivities called");
    const res = await fetch("http://localhost:5000/api/items");
    const result = await res.json();

    console.log("FULL RESPONSE:", result);
    dbItems = result; 

    renderRecent(dbItems);
    renderAll(dbItems);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
// ---------------- RECENT ----------------
function renderRecent(items) {
  const recentList = document.getElementById("recentList");
  if (!recentList) return;

  recentList.innerHTML = "";
  const recentItems = items.slice(-6).reverse();

  recentItems.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.title}</strong>
      <span class="tag">${item.type}</span>
    `;
    recentList.appendChild(li);
  });
}

// ---------------- ALL ----------------
function renderAll(items) {
  const allList = document.getElementById("allList");
  if (!allList) return;

  allList.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.title}</strong>
      <span class="tag">${item.type}</span>
    `;
    allList.appendChild(li);
  });
}
// ---------------- NEW: ADD ITEM FUNCTION ----------------
async function addItem(itemData) {
  try {
    const res = await fetch("http://localhost:5000/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(itemData)
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Item added successfully:", result);
      
      // 🔥 CRITICAL: Refresh the UI lists so the user sees the new item instantly!
      await loadActivities(); 
    } else {
      console.error("Failed to add item. Server status:", res.status);
    }
  } catch (err) {
    console.error("Error adding item:", err);
  }
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadActivities();
  setupProfileDropdown();
  updateNotificationBadge();

  // OPTIONAL: If you have a form in your HTML, attach the function to it here:
  const itemForm = document.getElementById("itemForm");
  if (itemForm) {
    itemForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Stop page from doing a hard reload
      
      const itemData = {
        title: document.getElementById("itemTitle").value.trim(),
        type: document.getElementById("itemType").value,
        category: document.getElementById("itemCategory") ? document.getElementById("itemCategory").value : "Other",
        location: document.getElementById("itemLocation") ? document.getElementById("itemLocation").value.trim() : "",
        description: document.getElementById("itemDescription") ? document.getElementById("itemDescription").value.trim() : "",
        imageUrl: document.getElementById("itemImageUrl") ? document.getElementById("itemImageUrl").value.trim() : "",
      };

      const priceInput = document.getElementById("itemPrice");
      if (priceInput && (itemData.type === "sell" || itemData.type === "rent")) {
        itemData.price = priceInput.value.trim();
      }
      
      await addItem(itemData);
      
      itemForm.reset(); // Clear the form input inputs
    });
  }
});



// ---------------- NAVIGATION ----------------
window.showAll = function () {
    document.getElementById("recentSection").style.display = "none";
    document.getElementById("allPage").style.display = "block";
};

window.goBack = function () {
    document.getElementById("allPage").style.display = "none";
    document.getElementById("recentSection").style.display = "block";
};

window.handleClick = function (type) {
    window.location.href = `itemform.html?type=${type}`;
};

// ---------------- LIVE SEARCH FOR HOME PAGE ----------------
window.searchItems = function() {
  const it = document.getElementById("sea").value.trim().toLowerCase();
  const result = document.getElementById("result");
  const sd = document.getElementById("searchDrop");

  result.innerHTML = "";

  if (it === "") {
    sd.style.display = "none";
    return;
  }

  // Filter items in memory
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
*/

  