const socket = io(window.API_BASE_URL);

document.addEventListener("DOMContentLoaded", () => {
  initChatSystem();
});

let currentUserId = localStorage.getItem("userId");
let currentUsername = localStorage.getItem("username") || "Me";
let activeRecipientId = null;
let activeRecipientName = null;
let chatCountMap = {}; // Tracks message count to avoid unnecessary redraws

function initChatSystem() {
  if (!currentUserId) {
    alert("Please log in to access messages.");
    window.location.href = "../loginpage.html";
    return;
  }

  // Setup profile dropdown in top bar
  setupProfileDropdown();

  // Socket connection and registration
  socket.on("connect", () => {
    console.log("Connected to socket server");
    socket.emit("register", currentUserId);
  });

  // Listen for incoming messages
  socket.on("receiveMessage", (msg) => {
    console.log("Received message:", msg);
    if (activeRecipientId && (msg.senderId === activeRecipientId || msg.senderId === currentUserId)) {
      if (msg.senderId === activeRecipientId) {
        markConversationAsRead(activeRecipientId);
      }
      loadChatMessages(true);
    }
    loadConversations();
  });

  socket.on("messagesRead", (data) => {
    loadConversations();
    if (window.updateNotificationBadge) {
      window.updateNotificationBadge();
    }
  });

  // Listen for sent acknowledgment
  socket.on("messageSent", (msg) => {
    console.log("Message sent acknowledgment:", msg);
    if (activeRecipientId && msg.receiverId === activeRecipientId) {
      loadChatMessages(true);
    }
    loadConversations();
  });

  // Load conversations initially
  loadConversations().then((conversations) => {
    // Check if there is a redirection to chat from an item page
    const activeChatId = localStorage.getItem("activeChatUserId");
    const activeChatName = localStorage.getItem("activeChatUsername");

    if (activeChatId) {
      // Clear localStorage parameters so we don't re-trigger this next visit
      localStorage.removeItem("activeChatUserId");
      localStorage.removeItem("activeChatUsername");
      
      startOrOpenChat(activeChatId, activeChatName);
    } else if (conversations && conversations.length > 0) {
      // Automatically open the first conversation on load instead of welcome screen
      selectConversation(conversations[0].userId, conversations[0].username);
    }
  });

  // Slowly refresh conversation list in the background as a fallback
  setInterval(loadConversations, 15000);
}

// ---------------- LOAD CONVERSATION THREADS ----------------
async function loadConversations() {
  const listContainer = document.getElementById("conversationList");
  if (!listContainer) return;

  try {
    const res = await fetch(`${window.API_BASE_URL}/api/messages/conversations/${currentUserId}`);
    if (!res.ok) throw new Error("Failed to load conversations");
    
    let conversations = await res.json();
    
    // Clear list
    listContainer.innerHTML = "";

    if (conversations.length === 0 && !activeRecipientId) {
      listContainer.innerHTML = `
        <div class="loading-chats">
          <div style="font-size:24px; margin-bottom:8px;">💬</div>
          No messages yet.
        </div>
      `;
      return conversations;
    }

    // If there is an active chat with someone who is NOT yet in the conversations list (no messages sent yet),
    // we prepend a temporary chat item so the user can see who they are chatting with.
    const hasActiveChatInList = conversations.some(c => c.userId === activeRecipientId);
    if (activeRecipientId && !hasActiveChatInList) {
      conversations.unshift({
        userId: activeRecipientId,
        username: activeRecipientName,
        avatar: activeRecipientName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        lastMessage: "No messages yet. Say hello!",
        time: new Date().toISOString()
      });
    }

    conversations.forEach(chat => {
      const itemDiv = document.createElement("div");
      itemDiv.className = `chat-item ${chat.userId === activeRecipientId ? 'active' : ''}`;
      itemDiv.onclick = () => selectConversation(chat.userId, chat.username);

      const formattedTime = formatChatTime(chat.time);

      const badgeHtml = (chat.unreadCount && chat.unreadCount > 0 && chat.userId !== activeRecipientId)
        ? `<span class="unread-badge" style="background:var(--teal); color:white; border-radius:50%; width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; margin-left:8px; line-height:1;">${chat.unreadCount}</span>`
        : '';

      itemDiv.innerHTML = `
        <div class="chat-avatar">${chat.avatar || "👤"}</div>
        <div class="chat-details">
          <div class="chat-meta">
            <span class="chat-name">${chat.username}</span>
            <span class="chat-time" style="display:flex; align-items:center;">${formattedTime}${badgeHtml}</span>
          </div>
          <span class="chat-preview">${chat.lastMessage}</span>
        </div>
      `;
      listContainer.appendChild(itemDiv);
    });

    return conversations;

  } catch (error) {
    console.error("Error loading conversations:", error);
    if (listContainer) {
      listContainer.innerHTML = `
        <div class="loading-chats" style="color: #ef4444;">
          ⚠️ Error loading conversations.
        </div>
      `;
    }
    return [];
  }
}

// ---------------- OPEN CHAT (FROM ITEM CARDS OR SIDEBAR) ----------------
async function startOrOpenChat(recipientId, recipientName) {
  if (recipientId === currentUserId) return;

  let dispName = recipientName || "Item Owner";
  const genericNames = ["Lost Item Owner", "Founder", "Seller", "Owner", "Item Owner"];

  // Fetch real name if recipientName is generic (e.g. "Founder") or not provided
  if (!recipientName || genericNames.includes(recipientName)) {
    try {
      const res = await fetch(`${window.API_BASE_URL}/api/profile/${recipientId}`);
      if (res.ok) {
        const profile = await res.json();
        if (profile && profile.name) {
          dispName = profile.name;
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile info:", err);
    }
  }

  selectConversation(recipientId, dispName);
}

// Select conversation
function selectConversation(recipientId, recipientName) {
  activeRecipientId = recipientId;
  activeRecipientName = recipientName;

  // Mark this conversation as read
  markConversationAsRead(recipientId);

  // Highlight selected item in sidebar
  const items = document.querySelectorAll(".chat-item");
  items.forEach(item => item.classList.remove("active"));
  
  // Show active view, hide welcome
  document.getElementById("chatWelcome").style.display = "none";
  document.getElementById("chatActive").style.display = "flex";

  // Update Header details
  document.getElementById("activeRecipientName").textContent = recipientName;
  const avatarInitials = recipientName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  document.getElementById("activeRecipientAvatar").textContent = avatarInitials;

  // Mobile layout adjustment
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.classList.add("active-chat-open");
  const backBtn = document.querySelector(".mobile-back-btn");
  if (backBtn) backBtn.style.display = "inline-block";

  // Load chat history
  loadChatMessages(true);
  loadConversations(); // Update active highlights
}

// Mobile back button helper
window.closeChatMobile = function() {
  activeRecipientId = null;
  activeRecipientName = null;
  document.getElementById("chatWelcome").style.display = "flex";
  document.getElementById("chatActive").style.display = "none";
  
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.classList.remove("active-chat-open");
  const backBtn = document.querySelector(".mobile-back-btn");
  if (backBtn) backBtn.style.display = "none";

  loadConversations();
};

// ---------------- LOAD MESSAGES HISTORY ----------------
async function loadChatMessages(shouldScrollToBottom = false) {
  if (!activeRecipientId) return;

  const messagesContainer = document.getElementById("chatMessages");
  if (!messagesContainer) return;

  try {
    const res = await fetch(`${window.API_BASE_URL}/api/messages/${currentUserId}/${activeRecipientId}`);
    if (!res.ok) throw new Error("Failed to load chat history");

    const messages = await res.json();
    
    // Save message count to avoid redrawing if nothing changed
    const currentCount = messages.length;
    if (chatCountMap[activeRecipientId] === currentCount && !shouldScrollToBottom) {
      return; // Skip redraw
    }
    chatCountMap[activeRecipientId] = currentCount;

    messagesContainer.innerHTML = "";

    if (messages.length === 0) {
      messagesContainer.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--muted); font-size:13px; font-style:italic;">
          No messages yet. Send a message to start the conversation!
        </div>
      `;
      return;
    }

    let lastDateStr = null;

    messages.forEach(msg => {
      const msgDate = new Date(msg.createdAt);
      const dateStr = msgDate.toDateString();

      // Render date separator if the day changes
      if (dateStr !== lastDateStr) {
        const separator = document.createElement("div");
        separator.className = "chat-date-separator";

        let label = "";
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        if (dateStr === now.toDateString()) {
          label = "Today";
        } else if (dateStr === yesterday.toDateString()) {
          label = "Yesterday";
        } else {
          label = msgDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        }

        separator.innerHTML = `<span>${label}</span>`;
        messagesContainer.appendChild(separator);
        lastDateStr = dateStr;
      }

      const bubble = document.createElement("div");
      const isSent = msg.senderId === currentUserId;
      bubble.className = `message-bubble ${isSent ? 'sent' : 'received'}`;
      
      const timeStr = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      bubble.innerHTML = `
        <span>${msg.text}</span>
        <span class="message-timestamp">${timeStr}</span>
      `;
      messagesContainer.appendChild(bubble);
    });

    if (shouldScrollToBottom) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

  } catch (error) {
    console.error("Error loading chat history:", error);
  }
}

// ---------------- SEND MESSAGE ----------------
window.sendMessage = function() {
  const input = document.getElementById("messageInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text || !activeRecipientId) return;

  // Clear input instantly for better UX
  input.value = "";
  input.focus();

  // Emit via socket
  socket.emit("sendMessage", {
    senderId: currentUserId,
    receiverId: activeRecipientId,
    text: text
  });
};

// Helper to format timestamps nicely
function formatChatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ---------------- DYNAMIC PROFILE DROPDOWN (COPIED FROM HOME) ----------------
function setupProfileDropdown() {
  const userChip = document.querySelector(".user-chip");
  if (!userChip) return;

  userChip.style.position = "relative";
  userChip.style.cursor = "pointer";
  userChip.id = "userChip";

  const dropdown = document.createElement("div");
  dropdown.id = "profileDropdown";
  dropdown.className = "profile-dropdown";
  dropdown.style.display = "none";
  
  const usernameSpan = userChip.querySelector(".username");
  const avatarDiv = userChip.querySelector(".avatar");
  
  const fullname = usernameSpan ? usernameSpan.textContent.trim() : "Disha Lowanshi";
  const initials = avatarDiv ? avatarDiv.textContent.trim() : "DL";
  const email = fullname.toLowerCase().replace(/\s+/g, ".") + "@college.edu";

  dropdown.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${initials}</div>
      <div class="profile-info">
        <div class="profile-name">${fullname}</div>
        <div class="profile-email">${email}</div>
      </div>
    </div>
    <hr class="dropdown-divider">
    <a href="../item/post.html" class="dropdown-item"><span>📋</span> My Posts</a>
    <a href="../setting/setthing.html" class="dropdown-item"><span>⚙️</span> Settings</a>
    <hr class="dropdown-divider">
    <a href="../loginpage.html" class="dropdown-item logout-item"><span>🚪</span> Logout</a>
  `;

  userChip.appendChild(dropdown);

  userChip.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "flex" : "none";
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target !== userChip && !userChip.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
}

async function markConversationAsRead(recipientId) {
  try {
    const res = await fetch(`${window.API_BASE_URL}/api/messages/read/${recipientId}/${currentUserId}`, {
      method: "PUT"
    });
    if (res.ok) {
      if (window.updateNotificationBadge) {
        window.updateNotificationBadge();
      }
    }
  } catch (err) {
    console.error("Failed to mark conversation as read:", err);
  }
}
