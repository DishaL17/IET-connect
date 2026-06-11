const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["lost", "found", "sell", "rent"],
  },
  category: {
    type: String,
    required: true,
    default: "Other",
  },
  description: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  price: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Active", "Resolved"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Item", itemSchema);