const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createIdea,
  getIdeas,
  getIdea,
  updateIdea,
  deleteIdea,
  toggleFavorite,
} = require("../controllers/ideaController");

router.post("/", auth, createIdea);
router.get("/", auth, getIdeas);
router.get("/:id", auth, getIdea);
router.put("/:id", auth, updateIdea);
router.delete("/:id", auth, deleteIdea);
router.patch("/:id/favorite", auth, toggleFavorite);

module.exports = router;
