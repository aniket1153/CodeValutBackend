const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createPack,
  getPacks,
  getPack,
  updatePack,
  deletePack,
  toggleFavorite,
  toggleShare,
  getPackCodeBundle,
} = require("../controllers/packController");

router.post("/", auth, createPack);
router.get("/", auth, getPacks);
router.get("/:id/bundle", auth, getPackCodeBundle);
router.get("/:id", auth, getPack);
router.put("/:id", auth, updatePack);
router.delete("/:id", auth, deletePack);
router.patch("/:id/favorite", auth, toggleFavorite);
router.patch("/:id/share", auth, toggleShare);

module.exports = router;
