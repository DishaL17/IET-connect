const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
 clubName: {
  type: String,
  required: true
},
description: {
  type: String,
  required: true
},
headName: {
  type: String,
  required: true
},
  foundedYear: String,
  createdBy: String,
  status: {
  type: String,
  enum: ["pending", "approved"],
  default: "pending"
}
}, {
  timestamps: true
});

module.exports = mongoose.model("Club", clubSchema);