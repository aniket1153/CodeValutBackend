const router = require("express").Router();
const { getPublicResource, getPublicPack } = require("../controllers/publicController");

router.get("/resources/:slug", getPublicResource);
router.get("/packs/:slug", getPublicPack);

module.exports = router;
