const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  clubName: String,
  title: String,
  venue: String,
  date: Date,
  time: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "Announcement",
  announcementSchema
);