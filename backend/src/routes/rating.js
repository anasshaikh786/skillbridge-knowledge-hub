const express = require("express");
const { Course, Rating, User } = require("../models");
const { auth } = require("../middleware");

const router = express.Router();

router.post("/create", auth, async (req, res) => {
  const { courseId, rating, review } = req.body;
  const course = await Course.findById(courseId);
  if (!course || !(course.studentsEnrolled || []).some(u => String(u) === String(req.user._id))) {
    return res.status(403).json({ detail: "Enroll to rate" });
  }
  const existing = await Rating.findOne({ user: req.user._id, course: courseId });
  if (existing) {
    existing.rating = rating; existing.review = review;
    await existing.save();
    return res.json({ success: true, updated: true });
  }
  const rev = await Rating.create({ user: req.user._id, course: courseId, rating, review });
  res.json(rev);
});

router.get("/course/:id", async (req, res) => {
  const revs = await Rating.find({ course: req.params.id }).lean();
  for (const r of revs) r.user = await User.findById(r.user).select("-password_hash").lean();
  const avg = revs.length ? revs.reduce((a, r) => a + r.rating, 0) / revs.length : 0;
  res.json({ reviews: revs, avg: Math.round(avg * 10) / 10, count: revs.length });
});

module.exports = router;
