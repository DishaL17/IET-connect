function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return `${Math.floor(seconds / 86400)}d ago`;
}

let allActivities = [];


async function loadActivities() {
    try {
        const res = await fetch(window.API_BASE_URL + "/api/items"); 
        const data = await res.json();

        const now = new Date();
        const oneweekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentData = data.filter(item => {
            const itemDate = item.createdAt ? new Date(item.createdAt) : null;
            return itemDate && itemDate >= oneweekAgo;
        });
        allActivities = recentData.map(item => ({
            id: item.id,
            text: item.title,
            time: item.createdAt,
            type: item.type || "other"
        }));

        renderRecent();
       

    } catch (error) {
        console.error("Error loading activities:", error);
    }
}
function renderRecent() {
    const recentList = document.getElementById("recentList");
    recentList.innerHTML = "";

    const recent = allActivities.slice(0, 5);

    if (recent.length === 0) {
        recentList.innerHTML = `
            <li class="act-item" style="color: var(--muted); font-style: italic; padding: 10px; text-align: center; justify-content: center; ">
                No recent activity in the last 7 days.
            </li>
        `;
        return;
    }

    recent.forEach((act, index) => {
        const li = document.createElement("li");
        li.className = "act-item";
        li.style.justifyContent = "space-between";

        li.innerHTML = `
            <div class="act-left">
                <span class="act-number">${index + 1}</span>
                <div>
                    <div class="act-text">${act.text}</div>
                    <div class="act-time"> ${timeAgo(act.time)}</div>
                </div>
            </div>
            <span class="qc-tag tg-${act.type}" style="font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 800; cursor: default; text-transform: uppercase; margin-left: 12px; flex-shrink: 0; box-shadow: none; border: none; transform: none;">${act.type}</span>
        `;

        recentList.appendChild(li);
    });
}


window.onload = loadActivities;
