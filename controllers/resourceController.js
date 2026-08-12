const Resource = require("../models/Resource");
const { validateResourcePayload, normalizeTags } = require("../utils/validateResource");

const buildQuery = (userId, query) => {
  const filter = { user: userId };
  if (query.type && query.type !== "all") filter.type = query.type;
  if (query.language && query.language !== "all") filter.language = query.language;
  if (query.favorite === "true") filter.isFavorite = true;

  if (query.q) {
    const q = query.q.trim();
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { fileName: { $regex: q, $options: "i" } },
      { note: { $regex: q, $options: "i" } },
      { code: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }

  return filter;
};

exports.createResource = async (req, res) => {
  try {
    const errors = validateResourcePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    const resource = await Resource.create({
      title: req.body.title.trim(),
      type: req.body.type || "code",
      code: req.body.code || "",
      note: req.body.note || "",
      youtubeUrl: req.body.youtubeUrl || "",
      fileName: req.body.fileName || "",
      description: req.body.description || "",
      language: req.body.language || "javascript",
      tags: normalizeTags(req.body.tags),
      isFavorite: Boolean(req.body.isFavorite),
      isPublic: Boolean(req.body.isPublic),
      user: req.user,
    });

    if (resource.isPublic) {
      resource.ensureShareSlug();
      await resource.save();
    }

    return res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create resource",
      error: error.message,
    });
  }
};

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find(buildQuery(req.user, req.query)).sort({
      isFavorite: -1,
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Resources fetched successfully",
      data: resources,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
      error: error.message,
    });
  }
};

exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    if (resource.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    return res.status(200).json({
      success: true,
      message: "Resource fetched successfully",
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching resource",
      error: error.message,
    });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    if (resource.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const nextType = req.body.type || resource.type;
    const errors = validateResourcePayload(
      { ...resource.toObject(), ...req.body, type: nextType },
      { partial: true }
    );

    if (req.body.type === "youtube" || (nextType === "youtube" && req.body.youtubeUrl)) {
      const urlErrors = validateResourcePayload({
        title: req.body.title || resource.title,
        type: "youtube",
        youtubeUrl: req.body.youtubeUrl ?? resource.youtubeUrl,
      });
      if (urlErrors.length && urlErrors.some((e) => e.includes("YouTube"))) {
        return res.status(400).json({ success: false, message: urlErrors.join(", ") });
      }
    }

    if (errors.length && req.body.title === "") {
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    const fields = [
      "title",
      "type",
      "code",
      "note",
      "youtubeUrl",
      "fileName",
      "description",
      "language",
      "isFavorite",
      "isPublic",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) resource[field] = req.body[field];
    });

    if (req.body.tags !== undefined) resource.tags = normalizeTags(req.body.tags);

    if (resource.isPublic) resource.ensureShareSlug();
    if (req.body.isPublic === false) resource.isPublic = false;

    await resource.save();

    return res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update resource",
      error: error.message,
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    if (resource.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    await resource.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete resource",
      error: error.message,
    });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    if (resource.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    resource.isFavorite = !resource.isFavorite;
    await resource.save();

    return res.status(200).json({
      success: true,
      message: resource.isFavorite ? "Added to favorites" : "Removed from favorites",
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle favorite",
      error: error.message,
    });
  }
};

exports.toggleShare = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    if (resource.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    resource.isPublic = !resource.isPublic;
    if (resource.isPublic) resource.ensureShareSlug();
    await resource.save();

    return res.status(200).json({
      success: true,
      message: resource.isPublic ? "Resource is now public" : "Resource is now private",
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update share status",
      error: error.message,
    });
  }
};
