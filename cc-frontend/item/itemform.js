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
  const imageInput = document.getElementById("itemImage");
const preview = document.getElementById("imagePreview");

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

    if (type === "lost" || type === "found") {
      priceFieldWrapper.style.display = "none";
      inputPrice.removeAttribute("required");
      inputPrice.value = ""; 
      
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


  adjustFormFields();
  itemTypeSelect.addEventListener("change", adjustFormFields);

  let base64Image = "";

  // Handle image selection, preview, and downscaling compression
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        // Downscale image to maximum 800px width/height to save DB size
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality
        base64Image = canvas.toDataURL("image/jpeg", 0.7);

        // Render preview image
        preview.src = base64Image;
        preview.style.display = "block";
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    formMessage.className = "message";
    formMessage.style.display = "none";

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting Listing...";
    const userId = localStorage.getItem("userId");

    const payload = {
      title: document.getElementById("itemTitle").value.trim(),
      type: itemTypeSelect.value,
      category: document.getElementById("itemCategory").value,
      location: inputLocation.value.trim(),
      description: document.getElementById("itemDescription").value.trim(),
      imageUrl: base64Image || "", // Use base64 string
      userId: userId
    };

    if (payload.type === "sell" || payload.type === "rent") {
      payload.price = inputPrice.value.trim();
    }
 
    try {
      const res = await fetch(window.API_BASE_URL + "/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        formMessage.textContent = "🎉 Listing posted successfully! Redirecting...";
        formMessage.className = "message success";
        formMessage.style.display = "block";
        itemForm.reset();
        preview.style.display = "none";
        preview.src = "";

        setTimeout(() => {
          window.location.href = `${payload.type}.html`;
        }, 1500);

      } else {
        throw new Error(data.error || "Failed to save listing.");
      }

    } catch (err) {
      console.error("Form Submit Error:", err);
      formMessage.textContent = `❌ Error: ${err.message}`;
      formMessage.className = "message error";
      formMessage.style.display = "block";
      
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Listing";
    }
  });
});
