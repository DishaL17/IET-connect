document.addEventListener("DOMContentLoaded", () => {
  loadLostItems();
});

async function loadLostItems() {
  const container = document.getElementById("lostItems");

  if (!container) 
    return;
  

  try {
    const res = await fetch("http://localhost:5000/api/items?type=lost");
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

      card.innerHTML = `
        <img src="${item.imageUrl || 'placeholder.jpg'}" alt="item image">

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
            onclick="contactOwner('${item.userId}')">
            I Found It!
          </button>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading lost items:", error);
  }
}

function contactOwner(userId) {
  if (!userId) {
    console.error("No userId provided");
    return;
  }

  startChat(userId, "Lost Item Owner");
}