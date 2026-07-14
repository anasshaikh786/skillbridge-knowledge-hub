const express = require("express");
const { Progress } = require("../models");
const { auth } = require("../middleware");

const router = express.Router();

router.post("/update", auth, async (req, res) => {
  const { courseId, subsectionId } = req.body;
  await Progress.updateOne(
    { user: req.user._id, course: courseId },
    { $addToSet: { completedVideos: subsectionId }, $setOnInsert: { user: req.user._id, course: courseId } },
    { upsert: true }
  );
  res.json({ success: true });
});

router.get("/:courseId", auth, async (req, res) => {
  const p = await Progress.findOne({ user: req.user._id, course: req.params.courseId }).lean();
  res.json(p || { completedVideos: [] });
});

module.exports = router;
