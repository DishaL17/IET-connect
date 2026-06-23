document.addEventListener("DOMContentLoaded", () => {
  initReviewsPage();
});

const currentUserId = localStorage.getItem("userId");
const currentUsername = localStorage.getItem("username") || "Anonymous";

function initReviewsPage() {
  if (!currentUserId) {
    alert("Please log in to view reviews.");
    window.location.href = "loginpage.html";
    return;
  }

  // Load reviews list
  loadReviews();

  // Load modal dropdown options & setup triggers
  setupReviewModal();
}

// ---------------- LOAD REVIEWS ----------------
async function loadReviews() {
  const listContainer = document.getElementById("reviewList");
  if (!listContainer) return;

  try {
    const res = await fetch(`http://localhost:5000/api/reviews/${currentUserId}`);
    if (!res.ok) throw new Error("Failed to load reviews");

    const reviews = await res.json();
    listContainer.innerHTML = "";

    // Calculate Summary Stats
    updateSummaryStats(reviews);

    if (reviews.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--muted); font-size: 15px;">
          📭 You haven't received any reviews yet. Complete trades to receive reviews from others!
        </div>
      `;
      return;
    }

    reviews.forEach(review => {
      const card = document.createElement("div");
      card.className = "review-card";

      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

      card.innerHTML = `
        <div class="review-header">
          <span class="reviewer-name">${review.reviewerName}</span>
          <span class="review-stars" style="color: #fbbf24; font-size: 14px;">${stars}</span>
        </div>
        <p class="review-text" style="font-size: 14px; color: var(--muted); line-height: 1.4; margin: 5px 0 0;">
          "${review.text}"
        </p>
      `;
      listContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading reviews:", error);
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ff5c5c;">
        ⚠️ Failed to load reviews. Make sure the backend server is running.
      </div>
    `;
  }
}

// ---------------- CALCULATE SUMMARY STATS ----------------
function updateSummaryStats(reviews) {
  const avgEl = document.getElementById("ratingAvg");
  const starsEl = document.getElementById("ratingStars");
  const countEl = document.getElementById("ratingCount");
  const positiveEl = document.getElementById("ratingPositive");

  if (reviews.length === 0) {
    if (avgEl) avgEl.textContent = "0.0";
    if (starsEl) starsEl.textContent = "☆☆☆☆☆";
    if (countEl) countEl.textContent = "based on 0 reviews";
    if (positiveEl) positiveEl.textContent = "👍 0% Positive Feedback";
    return;
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = (sum / total).toFixed(1);

  // Rounded star representation
  const roundedRating = Math.round(sum / total);
  const starsStr = "★".repeat(roundedRating) + "☆".repeat(5 - roundedRating);

  // Positive rating (4 or 5 stars)
  const positiveCount = reviews.filter(r => r.rating >= 4).length;
  const positivePct = Math.round((positiveCount / total) * 100);

  if (avgEl) avgEl.textContent = avg;
  if (starsEl) starsEl.textContent = starsStr;
  if (countEl) countEl.textContent = `based on ${total} trade${total > 1 ? 's' : ''}`;
  if (positiveEl) positiveEl.textContent = `👍 ${positivePct}% Positive Feedback`;
}

// ---------------- REVIEW WRITING MODAL SYSTEM ----------------
function setupReviewModal() {
  const modal = document.getElementById("reviewModal");
  const openBtn = document.getElementById("openReviewModalBtn");
  const closeBtn = document.getElementById("closeReviewModalBtn");
  const form = document.getElementById("reviewForm");
  const recipientSelect = document.getElementById("reviewRecipient");

  if (!modal || !openBtn || !closeBtn || !form) return;

  // Open modal
  openBtn.addEventListener("click", async () => {
    modal.style.display = "flex";
    
    // Fetch users list to populate select
    try {
      const res = await fetch("http://localhost:5000/api/users");
      if (res.ok) {
        const users = await res.json();
        
        // Reset dropdown
        recipientSelect.innerHTML = '<option value="">Choose a campus member...</option>';
        
        // Filter out current user from dropdown options
        users.forEach(user => {
          if (user._id !== currentUserId) {
            const opt = document.createElement("option");
            opt.value = user._id;
            opt.textContent = user.name;
            recipientSelect.appendChild(opt);
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch users list for reviews:", err);
    }
  });

  // Close modal
  const closeModal = () => {
    modal.style.display = "none";
    form.reset();
  };
  closeBtn.addEventListener("click", closeModal);

  // Close clicking outside content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Submit Review Form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      recipientId: recipientSelect.value,
      reviewerName: currentUsername,
      rating: parseInt(document.getElementById("reviewRating").value),
      text: document.getElementById("reviewText").value.trim()
    };

    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Review submitted successfully!");
        closeModal();
        loadReviews(); // Reload list if reviewing self (useful for testing)
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("Submit Review Error:", err);
      alert(`Error submitting review: ${err.message}`);
    }
  });
}
