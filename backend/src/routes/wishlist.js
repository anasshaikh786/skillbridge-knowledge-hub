const express = require("express");
const { User, Course, Category, Section, SubSection, Rating } = require("../models");
const { auth } = require("../middleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  const ids = user.wishlist || [];
  if (!ids.length) return res.json([]);
  const courses = await Course.find({ _id: { $in: ids } }).lean();
  const out = [];
  for (const c of courses) {
    const inst = await User.findById(c.instructor).select("-password_hash").lean();
    const cat = c.category ? await Category.findById(c.category).lean() : null;
    const ratings = await Rating.find({ course: c._id }).lean();
    const avg = ratings.length ? ratings.reduce((a, r) => a + r.rating, 0) / ratings.length : 0;
    out.push({
      ...c,
      id: String(c._id),
      instructor: inst, category: cat,
      ratingCount: ratings.length,
      avgRating: Math.round(avg * 10) / 10,
      studentsEnrolled: (c.studentsEnrolled || []).length,
    });
  }
  res.json(out);
});

router.post("/toggle", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const cid = req.body.courseId;
  const in_ = user.wishlist.some(w => String(w) === String(cid));
  if (in_) {
    await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: cid } });
    res.json({ in: false });
  } else {
    await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: cid } });
    res.json({ in: true });
  }
});

module.exports = router;
