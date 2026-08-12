const Pack = require("../models/Pack");
const Resource = require("../models/Resource");
const { normalizeTags } = require("../utils/validateResource");

const ensureOwnedResources = async (resourceIds, userId) => {
  if (!resourceIds?.length) return [];
  const ids = [...new Set(resourceIds.map(String))];
  const found = await Resource.find({ _id: { $in: ids }, user: userId }).select("_id");
  if (found.length !== ids.length) {
    const err = new Error("One or more resources are invalid or not owned by you");
    err.status = 400;
    throw err;
  }
  return ids;
};

exports.createPack = async (req, res) => {
  try {
    const { title, description, tags, resources, isFavorite, isPublic } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const resourceIds = await ensureOwnedResources(resources || [], req.user);

    const pack = await Pack.create({
      title: title.trim(),
      description: description || "",
      tags: normalizeTags(tags),
      resources: resourceIds,
      isFavorite: Boolean(isFavorite),
      isPublic: Boolean(isPublic),
      user: req.user,
    });

    if (pack.isPublic) {
      pack.ensureShareSlug();
      await pack.save();
    }

    const populated = await Pack.findById(pack._id).populate("resources");

    return res.status(201).json({
      success: true,
      message: "Pack created successfully",
      data: populated,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to create pack",
    });
  }
};

exports.getPacks = async (req, res) => {
  try {
    const filter = { user: req.user };
    if (req.query.favorite === "true") filter.isFavorite = true;
    if (req.query.q) {
      const q = req.query.q.trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const packs = await Pack.find(filter)
      .populate("resources")
      .sort({ isFavorite: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Packs fetched successfully",
      data: packs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch packs",
      error: error.message,
    });
  }
};

exports.getPack = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id).populate("resources");

    if (!pack) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    if (pack.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    return res.status(200).json({
      success: true,
      message: "Pack fetched successfully",
      data: pack,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pack",
      error: error.message,
    });
  }
};

exports.updatePack = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id);

    if (!pack) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    if (pack.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({ success: false, message: "Title cannot be empty" });
      }
      pack.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) pack.description = req.body.description;
    if (req.body.tags !== undefined) pack.tags = normalizeTags(req.body.tags);
    if (req.body.isFavorite !== undefined) pack.isFavorite = Boolean(req.body.isFavorite);
    if (req.body.isPublic !== undefined) {
      pack.isPublic = Boolean(req.body.isPublic);
      if (pack.isPublic) pack.ensureShareSlug();
    }
    if (req.body.resources !== undefined) {
      pack.resources = await ensureOwnedResources(req.body.resources, req.user);
    }

    await pack.save();
    const populated = await Pack.findById(pack._id).populate("resources");

    return res.status(200).json({
      success: true,
      message: "Pack updated successfully",
      data: populated,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update pack",
    });
  }
};

exports.deletePack = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id);

    if (!pack) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    if (pack.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    await pack.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Pack deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete pack",
      error: error.message,
    });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id);

    if (!pack) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    if (pack.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    pack.isFavorite = !pack.isFavorite;
    await pack.save();

    const populated = await Pack.findById(pack._id).populate("resources");

    return res.status(200).json({
      success: true,
      message: pack.isFavorite ? "Added to favorites" : "Removed from favorites",
      data: populated,
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
    const pack = await Pack.findById(req.params.id);

    if (!pack) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    if (pack.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    pack.isPublic = !pack.isPublic;
    if (pack.isPublic) pack.ensureShareSlug();
    await pack.save();

    const populated = await Pack.findById(pack._id).populate("resources");

    return res.status(200).json({
      success: true,
      message: pack.isPublic ? "Pack is now public" : "Pack is now private",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update share status",
      error: error.message,
    });
  }
};

exports.getPackCodeBundle = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id).populate("resources");

    if (!pack) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    if (pack.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const codeBlocks = pack.resources
      .filter((r) => r && (r.type === "code" || r.type === "file") && r.code)
      .map((r) => {
        const header = `// === ${r.title}${r.fileName ? ` (${r.fileName})` : ""} ===`;
        return `${header}\n${r.code}`;
      })
      .join("\n\n");

    return res.status(200).json({
      success: true,
      message: "Code bundle ready",
      data: { title: pack.title, bundle: codeBlocks },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to build code bundle",
      error: error.message,
    });
  }
};
