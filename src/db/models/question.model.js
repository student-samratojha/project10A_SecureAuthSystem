const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  questions: {
    type: [String],
    required: true
  },

  answers: {
    type: [String],
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);