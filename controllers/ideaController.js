const Idea = require("../models/Idea");
const { normalizeTags } = require("../utils/validateResource");

const STATUSES = ["spark", "exploring", "building", "shipped", "paused"];

exports.createIdea = async (req, res) => {
  try {
    const { title, details, technologies, status, isFavorite } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Idea title is required" });
    }

    const idea = await Idea.create({
      title: title.trim(),
      details: details || "",
      technologies: normalizeTags(technologies),
      status: STATUSES.includes(status) ? status : "spark",
      isFavorite: Boolean(isFavorite),
      user: req.user,
    });

    return res.status(201).json({
      success: true,
      message: "Idea captured",
      data: idea,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create idea",
      error: error.message,
    });
  }
};

exports.getIdeas = async (req, res) => {
  try {
    const filter = { user: req.user };
    if (req.query.status && req.query.status !== "all") filter.status = req.query.status;
    if (req.query.favorite === "true") filter.isFavorite = true;
    if (req.query.q) {
      const q = req.query.q.trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { details: { $regex: q, $options: "i" } },
        { technologies: { $regex: q, $options: "i" } },
      ];
    }

    const ideas = await Idea.find(filter).sort({ isFavorite: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Ideas fetched successfully",
      data: ideas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ideas",
      error: error.message,
    });
  }
};

exports.getIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: "Idea not found" });
    }
    if (idea.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    return res.status(200).json({ success: true, data: idea });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch idea",
      error: error.message,
    });
  }
};

exports.updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: "Idea not found" });
    }
    if (idea.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({ success: false, message: "Title cannot be empty" });
      }
      idea.title = req.body.title.trim();
    }
    if (req.body.details !== undefined) idea.details = req.body.details;
    if (req.body.technologies !== undefined) {
      idea.technologies = normalizeTags(req.body.technologies);
    }
    if (req.body.status !== undefined) {
      if (!STATUSES.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      idea.status = req.body.status;
    }
    if (req.body.isFavorite !== undefined) idea.isFavorite = Boolean(req.body.isFavorite);

    await idea.save();

    return res.status(200).json({
      success: true,
      message: "Idea updated",
      data: idea,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update idea",
      error: error.message,
    });
  }
};

exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: "Idea not found" });
    }
    if (idea.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    await idea.deleteOne();
    return res.status(200).json({ success: true, message: "Idea deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete idea",
      error: error.message,
    });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: "Idea not found" });
    }
    if (idea.user.toString() !== req.user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    idea.isFavorite = !idea.isFavorite;
    await idea.save();
    return res.status(200).json({
      success: true,
      message: idea.isFavorite ? "Pinned idea" : "Unpinned idea",
      data: idea,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle favorite",
      error: error.message,
    });
  }
};
