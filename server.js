const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/packs", require("./routes/packRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));

// Backward-compatible alias for older clients
app.use("/api/snippets", require("./routes/resourceRoutes"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "CodeVault API running" });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
