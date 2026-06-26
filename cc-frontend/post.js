document.addEventListener("DOMContentLoaded", () => {
  loadMyPosts();
  setupProfileDropdown(); // Add support for the topbar profile chip!
});

// ---------------- FETCH AND RENDER MY POSTS ----------------
async function loadMyPosts() {
  const userId = localStorage.getItem("userId");
  const postsContainer = document.querySelector(".itm");
  if (!postsContainer) {
    console.error("No .itm container found on this page.");
    return;
  }

  try {
    // Fetch all items from the database
   const res = await fetch(
  `http://localhost:5000/api/myposts/${userId}`
);
    const items = await res.json();
    
    postsContainer.innerHTML = "";

    if (items.length === 0) {
      postsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px; background: white; border-radius: 20px; border: 1px dashed #cbd5e1; color: #64748b;">
          <h3> You haven't posted anything yet!</h3>
          <p style="font-size: 14px; margin-top: 5px; color: #94a3b8;">Use the Listing Forms to add items, and they will show up here.</p>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      // Setup display variables based on page type
      let locationText = "";
      if (item.type === "lost" || item.type === "found") {
        locationText = `📍 Location: ${item.location || "Unknown"}`;
      } else if (item.type === "sell" || item.type === "rent") {
        locationText = `👤 Contact: ${item.location || "Campus Member"}`;
      }

      // Format Price for sell/rent listings
      let priceBadge = "";
      if ((item.type === "sell" || item.type === "rent") && item.price) {
        priceBadge = `<span style="font-size: 14px; font-weight: 700; color: #2f7e78; background: #e0f7f5; padding: 4px 8px; border-radius: 6px; margin-top: 4px; display: inline-block;">${item.price}</span>`;
      }

      // Default placeholder image based on category if none uploaded
      let placeholderImg = "no-image.png"; 
     
      
      const imgSrc = item.imageUrl || placeholderImg;
      const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

      // Create post card
      const postDiv = document.createElement("div");
      postDiv.className = "post";
      postDiv.style.flexDirection = "column";
      postDiv.style.alignItems = "stretch";
      postDiv.style.width = "100%";
      postDiv.style.boxSizing = "border-box";
      
      // Dynamic color class for type tag
      const typeColorClass = item.type; // lost, found, sell, rent

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
    postsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; ">
        ⚠️ Failed to load your posts. Make sure your backend server is running on http://localhost:5000
      </div>
    `;
  }
}

// ---------------- MARK AS RESOLVED ----------------
window.resolvePost = async function(id) {
  if (!confirm("Are you sure you want to mark this item as resolved?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "Resolved" })
    });

    if (res.ok) {
      alert("Listing resolved successfully!");
      loadMyPosts(); // Refresh feed
    } else {
      alert("Failed to resolve listing.");
    }
  } catch (err) {
    console.error("Resolve error:", err);
  }
}

// ---------------- DELETE POST ----------------
window.deletePost = async function(id) {
  if (!confirm("Are you sure you want to delete this listing permanently? This cannot be undone.")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      alert("Listing deleted successfully!");
      loadMyPosts(); // Refresh feed
    } else {
      alert("Failed to delete listing.");
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
}

