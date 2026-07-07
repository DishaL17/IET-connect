
window.API_BASE_URL = "http://localhost:5000";

window.getRootPath = function(targetFile) {
  const subfolders = ["/home/", "/item/", "/message/", "/announcement/", "/setting/"];
  const currentPath = window.location.pathname;
  const isSubfolder = subfolders.some(folder => currentPath.includes(folder));
  return isSubfolder ? `../${targetFile}` : targetFile;
};

(function syncSession() {
  const token = localStorage.getItem("token");
  const isAuthPage = window.location.pathname.includes("loginpage.html") || 
                     window.location.pathname.includes("register.html") || 
                     window.location.pathname.includes("forgot-password.html");

  if (!token) {
    if (!isAuthPage) {
      alert("Please log in to continue.");
      window.location.href = getRootPath("loginpage.html");
    }
    return;
  }

  function parseJwt(t) {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  const payload = parseJwt(token);
  const currentTime = Math.floor(Date.now() / 1000);

  if (!payload || (payload.exp && payload.exp < currentTime)) {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    
    if (!isAuthPage) {
      alert(payload ? "Session expired. Please log in again." : "Session invalid. Please log in again.");
      window.location.href = getRootPath("loginpage.html");
    }
    return;
  }

  localStorage.setItem("userId", payload._id);
  localStorage.setItem("username", payload.name);
  localStorage.setItem("role", payload.role);
})();

async function searchItems() {
    const query = document.getElementById("sea").value.trim();
    const resultBox = document.getElementById("result");
    const drop = document.getElementById("searchDrop");
    if (!query) {
        drop.style.display = "none";
        resultBox.innerHTML = "";
        return;
    }
    try {
        const res = await fetch(window.API_BASE_URL + "/api/items");
        const data = await res.json();

       
        const filtered = data.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
        );

  
        drop.style.display = "block";

     
        resultBox.innerHTML = "";

      
        if (filtered.length === 0) {
            resultBox.innerHTML = "<li>No results found</li>";
            return;
        }

        filtered.slice(0, 5).forEach(item => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";
            li.style.cursor = "pointer";
            
            const typeLabels = {
              lost: "Lost",
              found: "Found",
              sell: "For Sale",
              rent: "Rental"
            };
            const typeLabel = typeLabels[item.type] || item.type;

            li.innerHTML = `
                <span>${item.title}</span>
                <span style="font-size: 11px; color: var(--teal); background: var(--teal-lt); padding: 2px 8px; border-radius: 10px; font-weight: 800; text-transform: uppercase;">
                  ${typeLabel}
                </span>
            `;


            li.onclick = () => {
                drop.style.display = "none";
                window.location.href = getRootPath("item/" + item.type + ".html?id=" + item._id);
            };

            resultBox.appendChild(li);
        });

    } catch (error) {
        console.error("Search error:", error);
    }
}

window.startChat = function(ownerId, ownerName) {
  const currentUserId = localStorage.getItem("userId");
  if (!currentUserId) {
    alert("Please log in to chat with the owner.");
    window.location.href = getRootPath("loginpage.html");
    return;
  }
  
  if (currentUserId === ownerId) {
    alert("This is your own listing!");
    return;
  }
  
  localStorage.setItem("activeChatUserId", ownerId);
  localStorage.setItem("activeChatUsername", ownerName || "Item Owner");
  window.location.href = getRootPath("message/notification.html");
};

window.updateNotificationBadge = async function() {
  const currentUserId = localStorage.getItem("userId");
  if (!currentUserId) return;

  try {
    const res = await fetch(`${window.API_BASE_URL}/api/messages/unread-count/${currentUserId}`);
    if (!res.ok) return;
    const { count } = await res.json();

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      if (link.textContent.includes("Messages") || link.href.includes("notification.html")) {
        let badge = link.querySelector(".nav-badge");
        if (badge) {
          badge.remove();
        }
        if (count > 0) {
          badge = document.createElement("span");
          badge.className = "nav-badge";
          badge.textContent = count;
          link.appendChild(badge);
        }
      }
    });
  } catch (err) {
    console.error("Error updating notification badge:", err);
  }
};
function getCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    return JSON.parse(
      atob(token.split(".")[1])
    );
  } catch {
    return null;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();

  if (!user) return;

  const usernameEl = document.querySelector(".user-chip .username");
  const avatarEl = document.querySelector(".user-chip .avatar");

  if (usernameEl) {
    usernameEl.textContent = user.name;
  }

  if (avatarEl) {
    avatarEl.textContent = user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  window.updateNotificationBadge();
});

(function initBackgroundSocket() {
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  if (!currentUserId || !token) return;

 
  if (window.location.pathname.includes("notification.html")) {
    return;
  }

  if (typeof io === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
    script.onload = () => {
      connectBackgroundSocket();
    };
    document.head.appendChild(script);
  } else {
    connectBackgroundSocket();
  }

  function connectBackgroundSocket() {
    const socket = io(window.API_BASE_URL);

    socket.on("connect", () => {
      socket.emit("register", currentUserId);
    });

    socket.on("receiveMessage", (msg) => {
    
      window.updateNotificationBadge();
    });

    socket.on("messagesRead", () => {
    
      window.updateNotificationBadge();
    });
  }
})();


