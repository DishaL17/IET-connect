document.addEventListener("DOMContentLoaded", () => {
  loadRentItems();
});

async function loadRentItems() {
  const container = document.getElementById("rentItems");
  if (!container) return;

  try {
    const res = await fetch("http://localhost:5000/api/items?type=rent&status=Active");
    const items = await res.json();
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML =`
    <div class="no-items" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
      <i class="fi fi-rr-box-open" style="font-size: 60px; display: block; margin-bottom: 10px;"></i>
      <p style="font-size: 1.1rem;">No  items for rent reported yet.</p>
    </div>
  `;
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "item";
      card.id = `item_${item._id}`;

      const defaultPlaceholder =  "no-image.png";
      const imgSrc = item.imageUrl || defaultPlaceholder;
      const ownerId = (item.userId && typeof item.userId === "object") ? item.userId._id : item.userId;
      const ownerName = (item.userId && typeof item.userId === "object") ? item.userId.name : "Campus Member";
      const priceText = item.price ? (isNaN(item.price) ? item.price : `₹${item.price}`) : "Free";

      card.innerHTML = `
        <img src="${imgSrc}" alt="${item.title}">
        <span class="identity">${item.category || "Other"}</span>
        <span class="name">${item.title}</span>
        <span class="location">Owner: ${ownerName}</span>
        <div class="last">
          <span class="time">${priceText}</span>
          <button class="claim" onclick="event.stopPropagation(); startChat('${ownerId}', '${ownerName.replace(/'/g, "\\'")}')">Enquire</button>
        </div>
      `;
      card.addEventListener("click", () => {
    openModal(item);
});

container.appendChild(card);
    });

   
   
  } catch (error) {
    console.error("Error loading rental items:", error);
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff5c5c;">
        ⚠️ Failed to load items. Make sure backend is running.
      </div>
    `;
  }
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