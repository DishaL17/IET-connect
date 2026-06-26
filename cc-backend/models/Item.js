const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: String,
  type: String,
  category: String,
  description: String,
  location: String,
  price: String,
  imageUrl: String,
  status: {
  type: String,
  enum: ["Active", "Resolved"],
  default: "Active"
},

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
      required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);