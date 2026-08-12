const Resource = require("../models/Resource");
const Pack = require("../models/Pack");

exports.getPublicResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      shareSlug: req.params.slug,
      isPublic: true,
    }).select("-user");

    if (!resource) {
      return res.status(404).json({ success: false, message: "Shared resource not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Shared resource fetched",
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shared resource",
      error: error.message,
    });
  }
};

exports.getPublicPack = async (req, res) => {
  try {
    const pack = await Pack.findOne({
      shareSlug: req.params.slug,
      isPublic: true,
    })
      .populate({
        path: "resources",
        select: "-user",
      })
      .select("-user");

    if (!pack) {
      return res.status(404).json({ success: false, message: "Shared pack not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Shared pack fetched",
      data: pack,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shared pack",
      error: error.message,
    });
  }
};
