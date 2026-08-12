const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
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

// Ensure DB is connected before API routes (needed for Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "CodeVault Backend API",
    health: "/api/health",
    endpoints: {
      auth: "/api/auth",
      resources: "/api/resources",
      packs: "/api/packs",
      ideas: "/api/ideas",
      public: "/api/public",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "CodeVault API running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/packs", require("./routes/packRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));
app.use("/api/snippets", require("./routes/resourceRoutes"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

module.exports = app;
