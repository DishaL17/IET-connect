let currentTab = "listings";
let myAnnouncements = [];

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  const tabContainer = document.getElementById("postsTabContainer");

  if (role === "clubAdmin" || role === "admin") {
    if (tabContainer) {
      tabContainer.style.display = "flex";
    }
  }

  loadTabContent();
});

window.switchTab = function(tab) {
  currentTab = tab;
  
  const tabListings = document.getElementById("tabListings");
  const tabAnnouncements = document.getElementById("tabAnnouncements");
  
  if (tab === "listings") {
    tabListings.classList.add("active");
    tabAnnouncements.classList.remove("active");
  } else {
    tabListings.classList.remove("active");
    tabAnnouncements.classList.add("active");
  }
  
  loadTabContent();
}

function loadTabContent() {
  if (currentTab === "listings") {
    loadMyPosts();
  } else {
    loadMyAnnouncements();
  }
}

// ---------------- FETCH AND RENDER MY POSTS (ITEMS) ----------------
async function loadMyPosts() {
  const userId = localStorage.getItem("userId");
  const postsContainer = document.querySelector(".itm");
  if (!postsContainer) return;

  try {
    const res = await fetch(`${window.API_BASE_URL}/api/myposts/${userId}`);
    const items = await res.json();
    
    postsContainer.innerHTML = "";

    if (items.length === 0) {
      postsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px; background: white; border-radius: 20px; border: 1px dashed #cbd5e1; color: #64748b; width: 100%; box-sizing: border-box;">
          <h3>You haven't posted any items yet!</h3>
          <p style="font-size: 14px; margin-top: 5px; color: #94a3b8;">Use the Listing Forms to add items, and they will show up here.</p>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      let locationText = "";
      if (item.type === "lost" || item.type === "found") {
        locationText = `📍 Location: ${item.location || "Unknown"}`;
      } else if (item.type === "sell" || item.type === "rent") {
        locationText = `👤 Contact: ${item.location || "Campus Member"}`;
      }

      let priceBadge = "";
      if ((item.type === "sell" || item.type === "rent") && item.price) {
        priceBadge = `<span style="font-size: 14px; font-weight: 700; color: #2f7e78; background: #e0f7f5; padding: 4px 8px; border-radius: 6px; margin-top: 4px; display: inline-block;">${item.price}</span>`;
      }

      const imgSrc = item.imageUrl || "no-image.png";
      const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

      const postDiv = document.createElement("div");
      postDiv.className = "post";
      postDiv.style.flexDirection = "column";
      postDiv.style.alignItems = "stretch";
      postDiv.style.width = "100%";
      postDiv.style.boxSizing = "border-box";
      
      const typeColorClass = item.type;

      postDiv.innerHTML = `
        <div class="det" style="width: 100%; display: flex; flex-direction: column; gap: 15px;">
          <div class="s" style="display: flex; gap: 15px; justify-content: space-between; align-items: flex-start; width: 100%;">
            <div class="g" style="display: flex; flex-direction: column; gap: 4px; text-align: left; flex: 1;">
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="situation ${typeColorClass}" style="text-transform: capitalize; font-weight: 800; font-size: 14px;">${item.type}</span>
                <span class="identity" style="font-size: 13px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 20px;">${item.category || "Other"}</span>
              </div>
              <h3 style="margin: 8px 0 4px; font-size: 18px; font-weight: 700; color: #1e293b; line-height: 1.3;">${item.title}</h3>
              <span class="location" style="font-size: 13px; color: #64748b;">${locationText}</span>
              ${priceBadge}
            </div>
            <img src="${imgSrc}" alt="${item.title}" style="height: 90px; width: 90px; object-fit: cover; border-radius: 10px; flex-shrink: 0; border: 1px solid #e2e8f0;">
          </div>
          
          <div class="time" style="font-size: 12px; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: -5px;">
            <span>Posted: ${formattedDate}</span>
            <span style="font-weight: 800; color: ${item.status === 'Resolved' ? '#16803d' : '#8b4747'};">
              Status: ${item.status === 'Resolved' ? '✅ Resolved' : '⭕ Active'}
            </span>
          </div>
          
          <span class="desc" style="font-size: 13px; color: #64748b; line-height: 1.4; text-align: left;">
            ${item.description || "<i>No description provided.</i>"}
          </span>
          
          <div style="display: flex; gap: 10px; margin-top: 5px;">
            ${item.status !== 'Resolved' ? `
              <button class="action-btn resolve-btn" onclick="resolvePost('${item._id}')" style="flex: 1; padding: 10px; font-size: 13px; font-weight: 700; color: #2f7e78; background: #e0f7f5; border: 1.5px solid #2f7e78; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                Mark as Resolved
              </button>
            ` : ''}
            <button class="action-btn delete-btn" onclick="deletePost('${item._id}')" style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #b40b0b; background: #fdeaea; border: 1.5px solid #b40b0b; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
              Delete
            </button>
          </div>
        </div>
      `;
      postsContainer.appendChild(postDiv);
    });
  } catch (err) {
    console.error("Error loading posts:", err);
  }
}

// ---------------- FETCH AND RENDER MY ANNOUNCEMENTS ----------------
async function loadMyAnnouncements() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const postsContainer = document.querySelector(".itm");
  if (!postsContainer) return;

  try {
    const res = await fetch(`${window.API_BASE_URL}/api/myannouncements/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!res.ok) throw new Error("Failed to load announcements");
    myAnnouncements = await res.json();
    postsContainer.innerHTML = "";

    if (myAnnouncements.length === 0) {
      postsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px; background: white; border-radius: 20px; border: 1px dashed #cbd5e1; color: #64748b; width: 100%; box-sizing: border-box;">
          <h3>No announcements created yet!</h3>
          <p style="font-size: 14px; margin-top: 5px; color: #94a3b8;">Use the Announcement Creation form to publish announcements for your club.</p>
        </div>
      `;
      return;
    }

    myAnnouncements.forEach(ann => {
      const formattedDate = ann.date ? new Date(ann.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A";
      const createdDate = new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

      const postDiv = document.createElement("div");
      postDiv.className = "post";
      postDiv.style.flexDirection = "column";
      postDiv.style.alignItems = "stretch";
      postDiv.style.width = "100%";
      postDiv.style.boxSizing = "border-box";

      postDiv.innerHTML = `
        <div class="det" style="width: 100%; display: flex; flex-direction: column; gap: 15px;">
          <div class="s" style="display: flex; gap: 15px; justify-content: space-between; align-items: flex-start; width: 100%;">
            <div class="g" style="display: flex; flex-direction: column; gap: 4px; text-align: left; flex: 1;">
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="situation rent" style="text-transform: uppercase; font-weight: 800; font-size: 12px; background: var(--rent-lt); padding: 2px 8px; border-radius: 6px;">Announcement</span>
                <span class="identity" style="font-size: 13px; color: #2f7e78; background: #e0f7f5; padding: 2px 8px; border-radius: 20px; font-weight: 700;">${ann.clubName || "Club"}</span>
              </div>
              <h3 style="margin: 8px 0 4px; font-size: 18px; font-weight: 700; color: #1e293b; line-height: 1.3;">${ann.title}</h3>
              <span class="location" style="font-size: 13px; color: #64748b;">📍 Venue: ${ann.venue || "Campus"}</span>
              <span class="location" style="font-size: 13px; color: #64748b; margin-top: -4px;">⏰ Time: ${ann.time || "N/A"} | Date: ${formattedDate}</span>
            </div>
          </div>
          
          <div class="time" style="font-size: 12px; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: -5px;">
            <span>Created: ${createdDate}</span>
          </div>
          
          <span class="desc" style="font-size: 13px; color: #64748b; line-height: 1.4; text-align: left; white-space: pre-wrap;">
            ${ann.description || "<i>No description provided.</i>"}
          </span>
          
          <div style="display: flex; gap: 10px; margin-top: 5px;">
            <button class="action-btn resolve-btn" onclick="openEditAnnouncementModal('${ann._id}')" style="flex: 1; padding: 10px; font-size: 13px; font-weight: 700; color: #2f7e78; background: #e0f7f5; border: 1.5px solid #2f7e78; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
              Edit Details
            </button>
            <button class="action-btn delete-btn" onclick="deleteAnnouncement('${ann._id}')" style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #b40b0b; background: #fdeaea; border: 1.5px solid #b40b0b; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
              Delete
            </button>
          </div>
        </div>
      `;
      postsContainer.appendChild(postDiv);
    });

  } catch (err) {
    console.error("Error loading announcements:", err);
  }
}

// ---------------- RESOLVE/DELETE ITEMS ----------------
window.resolvePost = async function(id) {
  if (!confirm("Are you sure you want to mark this item as resolved?")) return;
  try {
    const res = await fetch(`${window.API_BASE_URL}/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Resolved" })
    });
    if (res.ok) {
      alert("Listing resolved successfully!");
      loadMyPosts();
    } else {
      alert("Failed to resolve listing.");
    }
  } catch (err) {
    console.error("Resolve error:", err);
  }
};

window.deletePost = async function(id) {
  if (!confirm("Are you sure you want to delete this listing permanently? This cannot be undone.")) return;
  try {
    const res = await fetch(`${window.API_BASE_URL}/api/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Listing deleted successfully!");
      loadMyPosts();
    } else {
      alert("Failed to delete listing.");
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
};

// ---------------- ANNOUNCEMENT EDIT & DELETE HANDLERS ----------------
window.openEditAnnouncementModal = function(id) {
  const ann = myAnnouncements.find(a => a._id === id);
  if (!ann) return;

  document.getElementById("editAnnId").value = ann._id;
  document.getElementById("editAnnTitle").value = ann.title || "";
  document.getElementById("editAnnVenue").value = ann.venue || "";
  document.getElementById("editAnnTime").value = ann.time || "";
  document.getElementById("editAnnDesc").value = ann.description || "";

  if (ann.date) {
    const dateObj = new Date(ann.date);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    document.getElementById("editAnnDate").value = `${yyyy}-${mm}-${dd}`;
  } else {
    document.getElementById("editAnnDate").value = "";
  }

  document.getElementById("editAnnouncementModal").style.display = "flex";
};

window.closeEditAnnouncementModal = function() {
  document.getElementById("editAnnouncementModal").style.display = "none";
};

window.submitEditAnnouncement = async function(e) {
  e.preventDefault();
  const id = document.getElementById("editAnnId").value;
  const token = localStorage.getItem("token");

  const payload = {
    title: document.getElementById("editAnnTitle").value.trim(),
    venue: document.getElementById("editAnnVenue").value.trim(),
    date: document.getElementById("editAnnDate").value,
    time: document.getElementById("editAnnTime").value.trim(),
    description: document.getElementById("editAnnDesc").value.trim()
  };

  try {
    const res = await fetch(`${window.API_BASE_URL}/api/announcements/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("✅ Announcement updated successfully!");
      closeEditAnnouncementModal();
      loadMyAnnouncements();
    } else {
      const err = await res.json();
      alert(`❌ Update failed: ${err.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Update error:", err);
    alert("❌ Server connection error.");
  }
};

window.deleteAnnouncement = async function(id) {
  if (!confirm("Are you sure you want to delete this announcement permanently? This cannot be undone.")) return;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${window.API_BASE_URL}/api/announcements/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("✅ Announcement deleted successfully!");
      loadMyAnnouncements();
    } else {
      const err = await res.json();
      alert(`❌ Delete failed: ${err.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("❌ Server connection error.");
  }
};

// Handle clicks outside of modals to close them
window.onclick = function(e) {
  const editModal = document.getElementById("editAnnouncementModal");
  if (e.target === editModal) {
    closeEditAnnouncementModal();
  }
};

