const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { register, login, refresh, me } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", auth, me);

module.exports = router;
