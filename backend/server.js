require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/db");
const { seedCategories } = require("./src/models");

const app = express();
app.use(express.json({ limit: "10mb" }));
console.log("CORS_ORIGINS =", process.env.CORS_ORIGINS);

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(origin => origin.trim().replace(/\/$/, ""));

app.use(cors({
  origin: function (origin, callback) {
    console.log("Incoming Origin:", origin);

    // Allow Postman/server-to-server requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked Origin:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

// Normalize responses: strip _id → id, remove __v & password_hash, recursively
function normalize(x) {
  if (x === null || x === undefined) return x;
  if (Array.isArray(x)) return x.map(normalize);
  if (x instanceof Date) return x.toISOString();
  if (typeof x === "object") {
    if (x.constructor && x.constructor.name === "ObjectId") return String(x);
    if (typeof x.toHexString === "function") return x.toHexString();
    // Mongoose Document → convert to plain JSON first
    if (typeof x.toObject === "function" && x.$__) x = x.toObject({ versionKey: false });
    const out = {};
    for (const k of Object.keys(x)) {
      if (k === "_id") { out.id = String(x._id); continue; }
      if (k === "__v" || k === "password_hash") continue;
      out[k] = normalize(x[k]);
    }
    return out;
  }
  return x;
}
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
  const orig = res.json.bind(res);
  res.json = (body) => orig(normalize(body));
  next();
});

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/profile", require("./src/routes/profile"));
app.use("/api/category", require("./src/routes/category"));
app.use("/api/course", require("./src/routes/course"));
app.use("/api/media", require("./src/routes/media"));
app.use("/api/payment", require("./src/routes/payment"));
app.use("/api/rating", require("./src/routes/rating"));
app.use("/api/course-progress", require("./src/routes/progress"));
app.use("/api/cart", require("./src/routes/cart"));
app.use("/api/wishlist", require("./src/routes/wishlist"));
app.use("/api/instructor", require("./src/routes/instructor"));

app.get("/api", (req, res) => res.json({ message: "SkillBridge API", status: "ok" }));
app.get("/api/", (req, res) => res.json({ message: "SkillBridge API", status: "ok" }));

app.post("/api/seed/categories", async (req, res) => {
  const inserted = await seedCategories();
  res.json({ inserted });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("[error]", err.message);
  const status = err.status || 500;
  res.status(status).json({ detail: err.message || "Server error" });
});

const PORT = process.env.PORT || 8001;
connectDB().then(async () => {
  await seedCategories();
  app.listen(PORT, "0.0.0.0", () => console.log(`SkillBridge API on :${PORT}`));
});
