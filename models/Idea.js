const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    details: { type: String, default: "" },
    technologies: [{ type: String }],
    status: {
      type: String,
      enum: ["spark", "exploring", "building", "shipped", "paused"],
      default: "spark",
    },
    isFavorite: { type: Boolean, default: false },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);
