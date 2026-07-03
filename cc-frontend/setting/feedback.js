document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to submit feedback.");
      window.location.href = "../loginpage.html";
      return;
    }

    const payload = {
      userId: userId,
      feedbackType: document.getElementById("feedbackType").value,
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim()
    };

    const submitBtn = form.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const successMsg = document.createElement("div");
        successMsg.style.background = "#dcfce7";
        successMsg.style.color = "#1b8843";
        successMsg.style.padding = "14px";
        successMsg.style.borderRadius = "14px";
        successMsg.style.marginTop = "15px";
        successMsg.style.fontWeight = "700";
        successMsg.style.textAlign = "center";
        successMsg.textContent = "🎉 Feedback submitted successfully! Redirecting...";
        
        form.appendChild(successMsg);
        form.reset();

        setTimeout(() => {
          window.location.href = "setthing.html";
        }, 1500);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      alert(`Error submitting feedback: ${err.message}`);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
