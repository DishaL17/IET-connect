document.addEventListener("DOMContentLoaded", () => {
  loadLostItems();
});

async function loadLostItems() {
  const container = document.getElementById("lostItems");

  if (!container) 
    return;
  

  try {
    const res = await fetch("http://localhost:5000/api/items?type=lost&status=Active");
 const items = await res.json();

 
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML =`
    <div class="no-items" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
      <i class="fi fi-rr-box-open" style="font-size: 60px; display: block; margin-bottom: 10px;"></i>
      <p style="font-size: 1.1rem;">No lost items reported yet.</p>
    </div>
  `;
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "item";
      card.id = `item_${item._id}`;
      const defaultPlaceholder = "no-image.png"; 
      const ownerId = (item.userId && typeof item.userId === "object") ? item.userId._id : item.userId;
      const ownerName = (item.userId && typeof item.userId === "object") ? item.userId.name : "Lost Item Owner";

      card.innerHTML = `
        <img src="${item.imageUrl || defaultPlaceholder }" alt="item image">

        <span class="identity">${item.category || "Unknown"}</span>

        <span class="name">${item.title || "No title"}</span>

        <span class="location">
          Last seen: ${item.location || "Not provided"}
        </span>

        <div class="last">
          <span class="time">
            ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
          </span>

          <button class="claim"
            onclick="event.stopPropagation(); contactOwner('${ownerId}', '${ownerName.replace(/'/g, "\\'")}')">
            I Found It!
          </button>
        </div>
      `;

      card.addEventListener("click", () => {
    openModal(item);
});

container.appendChild(card);
    });

    // Highlight search result if applicable
    highlightSearchItem();

  } catch (error) {
    console.error("Error loading lost items:", error);
  }
}

function contactOwner(userId, username) {
  if (!userId) {
    console.error("No userId provided");
    return;
  }

  startChat(userId, username || "Lost Item Owner");
}
function openModal(item){

    document.getElementById("itemModal").style.display="flex";

    document.getElementById("modalImage").src =
        item.imageUrl || "no-image.png";

    document.getElementById("modalTitle").textContent =
        item.title;

    document.getElementById("modalCategory").textContent =
        item.category || "Other";

    document.getElementById("modalLocation").textContent =
        item.location || "Campus";

    document.getElementById("modalPrice").textContent =
        item.price ? `₹${item.price}` : "Free";

    document.getElementById("modalDescription").textContent =
        item.description || "No description available.";

    const ownerId =
        (item.userId && typeof item.userId==="object")
        ? item.userId._id
        : item.userId;

    document.getElementById("modalChatBtn").onclick = () =>{
        startChat(ownerId,"Owner");
    };
}

function closeModal(){
    document.getElementById("itemModal").style.display="none";
}
window.onclick = function(e){

    const modal = document.getElementById("itemModal");

    if(e.target === modal){
        closeModal();
    }

};