const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title: String,
    code: String,
    language: String,
    tags: [String],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Snippet", snippetSchema);