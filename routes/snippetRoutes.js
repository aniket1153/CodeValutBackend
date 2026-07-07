const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createSnippet,
  getSnippets,
  getSnippet,
  updateSnippet,
  deleteSnippet,
} = require("../controllers/snippetController");

router.post("/", auth, createSnippet);
router.get("/", auth, getSnippets);
router.get("/:id", auth, getSnippet);
router.put("/:id", auth, updateSnippet);
router.delete("/:id", auth, deleteSnippet);

module.exports = router;