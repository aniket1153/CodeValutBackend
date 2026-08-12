const mongoose = require("mongoose");
const crypto = require("crypto");

const packSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
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

packSchema.methods.ensureShareSlug = function () {
  if (!this.shareSlug) {
    this.shareSlug = crypto.randomBytes(6).toString("hex");
  }
  return this.shareSlug;
};

module.exports = mongoose.model("Pack", packSchema);
