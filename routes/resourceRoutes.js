const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
  toggleFavorite,
  toggleShare,
} = require("../controllers/resourceController");

router.post("/", auth, createResource);
router.get("/", auth, getResources);
router.get("/:id", auth, getResource);
router.put("/:id", auth, updateResource);
router.delete("/:id", auth, deleteResource);
router.patch("/:id/favorite", auth, toggleFavorite);
router.patch("/:id/share", auth, toggleShare);

module.exports = router;
