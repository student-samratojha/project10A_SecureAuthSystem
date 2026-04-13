const mongoose = require("mongoose");
const { profile } = require("node:console");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    bio: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("User", userSchema);
