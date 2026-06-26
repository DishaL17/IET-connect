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
            time: item.createdAt
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

