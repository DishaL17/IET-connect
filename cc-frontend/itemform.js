document.addEventListener("DOMContentLoaded", () => {
  const itemTypeSelect = document.getElementById("itemType");
  const priceFieldWrapper = document.getElementById("priceFieldWrapper");
  const labelLocation = document.getElementById("labelLocation");
  const inputLocation = document.getElementById("itemLocation");
  const labelPrice = document.getElementById("labelPrice");
  const inputPrice = document.getElementById("itemPrice");
  const formTitle = document.getElementById("formTitle");
  const backBtn = document.getElementById("backBtn");
  const itemForm = document.getElementById("itemForm");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");

  // 1. Check URL query parameter to pre-select the type (e.g., itemform.html?type=lost)
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get("type");
  
  if (typeParam && ["lost", "found", "sell", "rent"].includes(typeParam.toLowerCase())) {
    itemTypeSelect.value = typeParam.toLowerCase();
  }

  // 2. Adjust Form Fields dynamically based on Type selection
  function adjustFormFields() {
    const type = itemTypeSelect.value;
    
    // Update Form Header Title
    if (type === "lost") {
      formTitle.textContent = "Report a Lost Item";
      backBtn.href = "lost.html";
      backBtn.textContent = "← Lost Items";
    } else if (type === "found") {
      formTitle.textContent = "Report a Found Item";
      backBtn.href = "found.html";
      backBtn.textContent = "← Found Items";
    } else if (type === "sell") {
      formTitle.textContent = "List an Item for Sale";
      backBtn.href = "sell.html";
      backBtn.textContent = "← For Sale";
    } else if (type === "rent") {
      formTitle.textContent = "List a Rental Item";
      backBtn.href = "rent.html";
      backBtn.textContent = "← Rentals";
    }

    // Toggle Price field & adjust labels/placeholders
    if (type === "lost" || type === "found") {
      priceFieldWrapper.style.display = "none";
      inputPrice.removeAttribute("required");
      inputPrice.value = ""; // Clear if previously typed
      
      labelLocation.textContent = "Last Seen Location";
      inputLocation.placeholder = "e.g. Library 3rd Floor, Canteen, Ground";
    } else {
      priceFieldWrapper.style.display = "flex";
      inputPrice.setAttribute("required", "true");
      
      if (type === "sell") {
        labelPrice.textContent = "Selling Price";
        inputPrice.placeholder = "e.g. ₹500, ₹12,000";
        labelLocation.textContent = "Seller Info / Contact details";
        inputLocation.placeholder = "e.g. Disha (Room 302 / Mob: 9876...)";
      } else if (type === "rent") {
        labelPrice.textContent = "Rental Fee";
        inputPrice.placeholder = "e.g. Free, ₹50/day, ₹200/week";
        labelLocation.textContent = "Owner Info / Contact details";
        inputLocation.placeholder = "e.g. John (Block B / Mob: 8876...)";
      }
    }
  }

  // Set up initial state and run adjustments
  adjustFormFields();
  itemTypeSelect.addEventListener("change", adjustFormFields);

  // 3. Handle Form Submission
  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Hide previous messages
    formMessage.className = "message";
    formMessage.style.display = "none";

    // Disable button & show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting Listing...";

    // Collect Form Values
    const payload = {
      title: document.getElementById("itemTitle").value.trim(),
      type: itemTypeSelect.value,
      category: document.getElementById("itemCategory").value,
      location: inputLocation.value.trim(),
      description: document.getElementById("itemDescription").value.trim(),
      imageUrl: document.getElementById("itemImageUrl").value.trim(),
    };

    // Include price only if it's sell or rent
    if (payload.type === "sell" || payload.type === "rent") {
      payload.price = inputPrice.value.trim();
    }

    try {
      const res = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        // Success
        formMessage.textContent = "🎉 Listing posted successfully! Redirecting...";
        formMessage.className = "message success";
        formMessage.style.display = "block";
        itemForm.reset();

        // Redirect user back to the respective category page after 1.5s
        setTimeout(() => {
          window.location.href = `${payload.type}.html`;
        }, 1500);

      } else {
        // Server Error
        throw new Error(data.error || "Failed to save listing.");
      }

    } catch (err) {
      console.error("Form Submit Error:", err);
      formMessage.textContent = `❌ Error: ${err.message}`;
      formMessage.className = "message error";
      formMessage.style.display = "block";
      
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Listing";
    }
  });
});
