/* =======================================
   lnf.js — Campus Connect
   ======================================= */

// ── DATA ──────────────────────────────
const items = [
  { label: "Lost Laptop",          type: "lost"  },
  { label: "Found Phone",          type: "found" },
  { label: "Math Book for Sale",   type: "sell"  },
  { label: "Engineering Notes",    type: "sell"  },
  { label: "Calculator for Sale",  type: "sell"  },
  { label: "Cycle for Rent",       type: "rent"  },
  { label: "Lost Wallet",          type: "lost"  },
  { label: "Found ID Card",        type: "found" },
  { label: "Physics Textbook",     type: "sell"  },
  { label: "Power Bank for Rent",  type: "rent"  },
  { label: "Lost Umbrella",        type: "lost"  },
  { label: "Found Earphones",      type: "found" },
];

const activities = [
  { text: "Lost Laptop reported",       type: "lost"  },
  { text: "Found Phone submitted",      type: "found" },
  { text: "Math Book sold",             type: "sell"  },
  { text: "Cycle rented",              type: "rent"  },
  { text: "Calculator posted for sale", type: "sell"  },
  { text: "Engineering Notes uploaded", type: "sell"  },
  { text: "Lost ID Card reported",      type: "lost"  },
  { text: "Bag found near Canteen",     type: "found" },
];

const typeConfig = {
  lost:  { color: "#e05252", emoji: "🔦" },
  found: { color: "#16a34a", emoji: "✅" },
  sell:  { color: "#d97706", emoji: "🛍️" },
  rent:  { color: "#2563eb", emoji: "🔑" },
};

// ── SEARCH ────────────────────────────
function searchItems() {
  const val  = document.getElementById("sea").value.toLowerCase().trim();
  const drop = document.getElementById("searchDrop");
  const list = document.getElementById("result");

  if (!val) { drop.style.display = "none"; return; }

  const found = items.filter(i => i.label.toLowerCase().includes(val));
  list.innerHTML = "";

  if (found.length === 0) {
    list.innerHTML = '<li style="color:#94a3b8;font-weight:600">No items found</li>';
  } else {
    found.forEach(i => {
      const li = document.createElement("li");
      const c  = typeConfig[i.type];
      li.innerHTML = `<span style="color:${c.color}">${c.emoji}</span>  ${i.label}`;
      list.appendChild(li);
    });
  }
  drop.style.display = "block";
}

// Close on outside click
document.addEventListener("click", e => {
  const bar  = document.querySelector(".search-bar");
  const drop = document.getElementById("searchDrop");
  if (drop && bar && !bar.contains(e.target) && !drop.contains(e.target)) {
    drop.style.display = "none";
  }
});

// ── NAVIGATION ────────────────────────
function handleClick(type) {
  const routes = { lost: "lost.html", found: "found.html", sell: "sell.html", rent: "rent.html" };
  if (routes[type]) window.location.href = routes[type];
}

// ── RECENT ACTIVITY ───────────────────
function loadRecent() {
  const list = document.getElementById("recentList");
  if (!list) return;
  list.innerHTML = "";
  activities.slice(0, 2).forEach(a => {
    const li = document.createElement("li");
    const c  = typeConfig[a.type];
    li.innerHTML = `<span style="color:${c.color}">${c.emoji}</span> ${a.text}`;
    list.appendChild(li);
  });
}

function showAll() {
  // Hide all direct children of activity box except allPage
  const aside = document.getElementById("recentSection");
  Array.from(aside.children).forEach(el => {
    if (el.id !== "allPage") el.style.display = "none";
  });

  const allPage = document.getElementById("allPage");
  allPage.style.display = "block";

  const list = document.getElementById("allList");
  list.innerHTML = "";
  activities.forEach(a => {
    const li = document.createElement("li");
    const c  = typeConfig[a.type];
    li.innerHTML = `<span style="color:${c.color}">${c.emoji}</span> ${a.text}`;
    list.appendChild(li);
  });
}

function goBack() {
  const aside = document.getElementById("recentSection");
  Array.from(aside.children).forEach(el => { el.style.display = ""; });
  document.getElementById("allPage").style.display = "none";
}

// ── ANIMATED COUNTERS ─────────────────
function countUp(id, target, dur = 1200) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = target / (dur / 16);
  const t = setInterval(() => {
    current += step;
    if (current >= target) { el.textContent = target; clearInterval(t); return; }
    el.textContent = Math.floor(current);
  }, 16);
}

// ── INIT ──────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadRecent();
  countUp("lostCount",  24);
  countUp("foundCount", 18);
  countUp("sellCount",  41);
});