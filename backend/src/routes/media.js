const express = require("express");
const multer = require("multer");
const { auth } = require("../middleware");
const { uploadMedia } = require("../integrations");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
const router = express.Router();

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: "No file uploaded" });
  const result = await uploadMedia(req.file.buffer, req.file.mimetype);
  res.json(result);
});

module.exports = router;
