const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Allowed frontend URLs (comma-separated). Empty = allow all (dev-friendly).
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (Postman/curl) and same-origin requests
      if (!origin) return callback(null, true);

      // If CLIENT_URL not set, allow all (no CORS errors in early deploy)
      if (allowedOrigins.length === 0) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
