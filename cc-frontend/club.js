document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(
    window.location.search
  );

  const id = params.get("id");

  const res = await fetch(
    `http://localhost:5000/api/clubs/${id}`
  );

  const club = await res.json();

  document.getElementById("clubName").textContent =
    club.clubName;

  document.getElementById("headName").textContent =
    club.headName;

  document.getElementById("foundedYear").textContent =
    club.foundedYear;

  document.getElementById("description").textContent =
    club.description;

  document.getElementById("currentProjects").textContent =
    club.currentProjects || "";

  document.getElementById("futureScope").textContent =
    club.futureScope || "";

});