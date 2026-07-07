const Snippet = require("../models/Snippet");

// ✅ CREATE
exports.createSnippet = async (req, res) => {
  try {
    const { title, code, language, tags } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "Title, code, and language are required",
      });
    }

    const snippet = await Snippet.create({
      title,
      code,
      language,
      tags,
      user: req.user,
    });

    return res.status(201).json({
      success: true,
      message: "Snippet created successfully",
      data: snippet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create snippet",
      error: error.message,
    });
  }
};

// ✅ GET ALL
exports.getSnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user });

    return res.status(200).json({
      success: true,
      message: "Snippets fetched successfully",
      data: snippets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch snippets",
      error: error.message,
    });
  }
};

// ✅ GET ONE
exports.getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: "Snippet not found",
      });
    }

    // 🔐 Ownership check
    if (snippet.user.toString() !== req.user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Snippet fetched successfully",
      data: snippet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching snippet",
      error: error.message,
    });
  }
};

// ✅ UPDATE
exports.updateSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: "Snippet not found",
      });
    }

    // 🔐 Ownership check
    if (snippet.user.toString() !== req.user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const updatedSnippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Snippet updated successfully",
      data: updatedSnippet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update snippet",
      error: error.message,
    });
  }
};

// ✅ DELETE
exports.deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: "Snippet not found",
      });
    }

    // 🔐 Ownership check
    if (snippet.user.toString() !== req.user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    await snippet.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Snippet deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete snippet",
      error: error.message,
    });
  }
};