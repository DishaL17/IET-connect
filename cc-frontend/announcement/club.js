document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error("No club ID provided in URL parameters.");
    return;
  }

  // Load and render club details
  async function loadClubDetails() {
    try {
      const res = await fetch(`${window.API_BASE_URL}/api/clubs/${id}`);
      if (!res.ok) throw new Error("Failed to load club details.");
      const club = await res.json();

      document.getElementById("clubName").textContent = club.clubName;
      document.getElementById("headName").textContent = club.headName;
      document.getElementById("foundedYear").textContent = club.foundedYear;
      document.getElementById("description").textContent = club.description;
      document.getElementById("currentProjects").textContent = club.currentProjects || "";
      document.getElementById("futureScope").textContent = club.futureScope || "";

      // Authorization Check: Only club admin (ref/createdBy) or global admin
      const currentUserId = localStorage.getItem("userId");
      const currentUserRole = localStorage.getItem("role");
      const clubAdminId = club.clubAdmin ? club.clubAdmin.toString() : club.createdBy;

      const editBtn = document.getElementById("editClubBtn");
      if (editBtn) {
        if (currentUserId === clubAdminId || currentUserRole === "admin") {
          editBtn.style.display = "block";
          setupEditingFlow(club);
        } else {
          editBtn.style.display = "none";
        }
      }

    } catch (error) {
      console.error("Error loading club:", error);
    }
  }

  function setupEditingFlow(club) {
    const editBtn = document.getElementById("editClubBtn");
    const modal = document.getElementById("editClubModal");
    const closeBtn = document.getElementById("closeEditModal");
    const form = document.getElementById("editClubForm");

    if (!editBtn || !modal || !closeBtn || !form) return;

    // Open Modal and Pre-fill current details
    editBtn.onclick = () => {
      document.getElementById("editHeadName").value = club.headName || "";
      document.getElementById("editFoundedYear").value = club.foundedYear || "";
      document.getElementById("editDescription").value = club.description || "";
      document.getElementById("editCurrentProjects").value = club.currentProjects || "";
      document.getElementById("editFutureScope").value = club.futureScope || "";
      modal.style.display = "flex";
    };

    // Close Modal
    closeBtn.onclick = () => {
      modal.style.display = "none";
    };

    // Close Modal on clicking outside content area
    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };

    // Handle Form Submit
    form.onsubmit = async (e) => {
      e.preventDefault();

      const payload = {
        headName: document.getElementById("editHeadName").value.trim(),
        foundedYear: document.getElementById("editFoundedYear").value.trim(),
        description: document.getElementById("editDescription").value.trim(),
        currentProjects: document.getElementById("editCurrentProjects").value.trim(),
        futureScope: document.getElementById("editFutureScope").value.trim()
      };

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${window.API_BASE_URL}/api/clubs/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          alert("🎉 Club details updated successfully!");
          modal.style.display = "none";
          loadClubDetails(); // Reload and re-render
        } else {
          alert(`❌ Failed to update: ${data.error || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Error updating club:", err);
        alert("❌ Server connection error.");
      }
    };
  }

  loadClubDetails();
});