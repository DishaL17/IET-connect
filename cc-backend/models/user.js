const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    branch: {
      type: String,
      default: "",
    },
    phone_no: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified"
    },
    rollNumber: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);