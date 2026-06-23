const form = document.getElementById("announcementForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    clubName: document.getElementById("clubName").value,
    title: document.getElementById("title").value,
    venue: document.getElementById("venue").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value
  };

  try {
    const res = await fetch(
      "http://localhost:5000/api/announcements",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (res.ok) {
      document.getElementById("message").textContent =
        "✅ Announcement Created Successfully";

      form.reset();
    } else {
      document.getElementById("message").textContent =
        data.error || "Failed to create announcement";
    }

  } catch (error) {
    console.error(error);
    document.getElementById("message").textContent =
      "❌ Server Error";
  }
});