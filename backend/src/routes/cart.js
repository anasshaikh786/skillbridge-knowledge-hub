const express = require("express");
const { User, Course, Category, Section, SubSection, Rating } = require("../models");
const { auth } = require("../middleware");

const router = express.Router();

async function enrich(c) {
  const inst = await User.findById(c.instructor).select("-password_hash").lean();
  const cat = c.category ? await Category.findById(c.category).lean() : null;
  const sections = await Section.find({ _id: { $in: c.sections || [] } }).lean();
  for (const s of sections) s.subsections = await SubSection.find({ _id: { $in: s.subsections || [] } }).lean();
  const ratings = await Rating.find({ course: c._id }).lean();
  const avg = ratings.length ? ratings.reduce((a, r) => a + r.rating, 0) / ratings.length : 0;
  return {
    ...c,
    id: String(c._id),
    instructor: inst, category: cat, sections,
    ratingCount: ratings.length,
    avgRating: Math.round(avg * 10) / 10,
    studentsEnrolled: (c.studentsEnrolled || []).length,
  };
}

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  const ids = user.cart || [];
  if (!ids.length) return res.json({ items: [], total: 0 });
  const courses = await Course.find({ _id: { $in: ids } }).lean();
  const items = [];
  for (const c of courses) items.push(await enrich(c));
  const total = items.reduce((a, c) => a + Number(c.price || 0), 0);
  res.json({ items, total });
});

router.post("/add", auth, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $addToSet: { cart: req.body.courseId } });
  res.json({ success: true });
});

router.post("/remove", auth, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { cart: req.body.courseId } });
  res.json({ success: true });
});

module.exports = router;
