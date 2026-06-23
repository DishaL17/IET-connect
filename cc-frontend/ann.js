document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncements();
   loadClubs();
});

async function loadAnnouncements() {
  const container = document.getElementById("announcementList");

  try {
    const res = await fetch(
      "http://localhost:5000/api/announcements"
    );

    const announcements = await res.json();

    container.innerHTML = "";

   announcements.forEach(item => {
  const card = document.createElement("div");
  card.className = "a";

  card.innerHTML = `
    <div class="k">
      <span class="club">${item.clubName}</span>
      <span class="t">${item.title}</span>
      <span class="venue">
        ${item.venue || "Campus"}
      </span>
    </div>

    <div class="time">
      📅 ${item.date ? new Date(item.date).toLocaleDateString() : ""}
      ${item.time ? ` • ⏰ ${item.time}` : ""}
    </div>
  `;

  container.appendChild(card);
});

  } catch (error) {
    console.error(error);
  }
}
async function loadClubs() {
  const clubList = document.getElementById("clubList");

  try {
    const res = await fetch(
      "http://localhost:5000/api/clubs"
    );

    const clubs = await res.json();

    clubList.innerHTML = "";

    clubs.forEach(club => {
      const div = document.createElement("div");

      div.className = "cn";

      div.innerHTML = `
        <span class="c">${club.clubName}</span>
        <span class="ar">></span>
      `;

        div.addEventListener("click", () => {
    window.location.href =
      `club.html?id=${club._id}`;
  });

      clubList.appendChild(div);
    });

  } catch (error) {
    console.error(error);
  }
}
const role = localStorage.getItem("role");

if(role !== "admin"){
   document.getElementById("createAnnouncementBtn")
      .style.display = "none";
}