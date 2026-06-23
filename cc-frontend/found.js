document.addEventListener("DOMContentLoaded", () => {
  loadFoundItems();
});

async function loadFoundItems() {
  const container = document.getElementById("foundItems");
  if (!container) return;

  try {
    const res = await fetch("http://localhost:5000/api/items?type=found");
    const items = await res.json();
    container.innerHTML = "";

    if (items.length === 0) {
  container.innerHTML = `
    <div class="no-items" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
      <i class="fi fi-rr-box-open" style="font-size: 60px; display: block; margin-bottom: 10px;"></i>
      <p style="font-size: 1.1rem;">No found items reported yet.</p>
    </div>
  `;
  return;
}

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "item";

      const defaultPlaceholder = "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop";
      const imgSrc = item.imageUrl || defaultPlaceholder;
      const ownerId = (item.userId && typeof item.userId === "object") ? item.userId._id : item.userId;

      card.innerHTML = `
        <img src="${imgSrc}" alt="${item.title}" style="object-fit: cover; height: 180px; width: 100%; border-radius: 8px;">
        <span class="identity">${item.category || "Other"}</span>
        <span class="name">${item.title}</span>
        <span class="location">Last seen: ${item.location || "Unknown"}</span>
        <div class="last">
          <span class="time">${new Date(item.createdAt).toLocaleDateString()}</span>
          <button class="claim" onclick="startChat('${ownerId}', 'Founder')">Contact Founder</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading found items:", error);
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff5c5c;">
        ⚠️ Failed to load items. Make sure backend is running.
      </div>
    `;
  }
}
