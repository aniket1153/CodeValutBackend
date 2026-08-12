const mongoose = require("mongoose");
const crypto = require("crypto");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["code", "note", "youtube", "file"],
      default: "code",
    },
    code: { type: String, default: "" },
    note: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    description: { type: String, default: "" },
    language: { type: String, default: "javascript" },
    tags: [{ type: String }],
    isFavorite: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareSlug: { type: String, unique: true, sparse: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

resourceSchema.methods.ensureShareSlug = function () {
  if (!this.shareSlug) {
    this.shareSlug = crypto.randomBytes(6).toString("hex");
  }
  return this.shareSlug;
};

// Note: do not add a Mongo text index while keeping a field named `language`
// (MongoDB treats `language` as a text-search language override).

module.exports = mongoose.model("Resource", resourceSchema);
