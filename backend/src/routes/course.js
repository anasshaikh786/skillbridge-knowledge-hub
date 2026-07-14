const express = require("express");
const { Course, Section, SubSection, Category, User, Rating } = require("../models");
const { auth, requireRole } = require("../middleware");

const router = express.Router();

// Helper: enrich course with computed fields
async function enrichCourse(courseDoc) {
  const c = courseDoc.toObject ? courseDoc.toObject() : courseDoc;
  const instructor = await User.findById(c.instructor).select("-password_hash").lean();
  const category = c.category ? await Category.findById(c.category).lean() : null;
  const sections = await Section.find({ _id: { $in: c.sections || [] } }).lean();
  for (const s of sections) {
    s.subsections = await SubSection.find({ _id: { $in: s.subsections || [] } }).lean();
  }
  const ratings = await Rating.find({ course: c._id }).lean();
  const avg = ratings.length ? ratings.reduce((a, r) => a + r.rating, 0) / ratings.length : 0;
  c.instructor = instructor;
  c.category = category;
  c.sections = sections;
  c.ratingCount = ratings.length;
  c.avgRating = Math.round(avg * 10) / 10;
  c.studentsEnrolled = (c.studentsEnrolled || []).length;
  c.id = String(c._id);
  return c;
}

router.post("/create", auth, requireRole("Instructor"), async (req, res) => {
  const {
    courseName, courseDescription, whatYouWillLearn, price = 0,
    categoryId, thumbnail, tags = [], instructions = [], status = "Draft",
  } = req.body;
  const course = await Course.create({
    courseName, courseDescription, whatYouWillLearn, price: Number(price) || 0,
    instructor: req.user._id, category: categoryId,
    thumbnail: thumbnail || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    tags, instructions, status,
  });
  await User.updateOne({ _id: req.user._id }, { $push: { courses: course._id } });
  const enriched = await enrichCourse(course);
  res.json(enriched);
});

router.get("/all", async (req, res) => {
  const courses = await Course.find({ status: "Published" }).lean();
  const enriched = [];
  for (const c of courses) enriched.push(await enrichCourse(c));
  res.json(enriched);
});

router.get("/instructor/mine", auth, requireRole("Instructor"), async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).lean();
  const out = [];
  for (const c of courses) out.push(await enrichCourse(c));
  res.json(out);
});

router.get("/student/enrolled", auth, async (req, res) => {
  const { Progress } = require("../models");
  const courses = await Course.find({ studentsEnrolled: req.user._id }).lean();
  const out = [];
  for (const c of courses) {
    const e = await enrichCourse(c);
    const p = await Progress.findOne({ user: req.user._id, course: c._id }).lean();
    e.progress = p ? (p.completedVideos || []).map(String) : [];
    out.push(e);
  }
  res.json(out);
});

router.get("/:id", async (req, res) => {
  const c = await Course.findById(req.params.id).lean();
  if (!c) return res.status(404).json({ detail: "Course not found" });
  const enriched = await enrichCourse(c);
  const reviews = await Rating.find({ course: req.params.id }).lean();
  for (const r of reviews) {
    r.user = await User.findById(r.user).select("-password_hash").lean();
  }
  enriched.reviews = reviews;
  res.json(enriched);
});

router.put("/:id", auth, requireRole("Instructor"), async (req, res) => {
  const c = await Course.findById(req.params.id);
  if (!c || String(c.instructor) !== String(req.user._id)) {
    return res.status(404).json({ detail: "Course not found" });
  }
  const updates = {};
  for (const k of ["courseName", "courseDescription", "whatYouWillLearn", "price", "thumbnail", "tags", "instructions", "status"]) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  if (req.body.categoryId !== undefined) updates.category = req.body.categoryId;
  await Course.updateOne({ _id: c._id }, { $set: updates });
  res.json({ success: true });
});

router.delete("/:id", auth, requireRole("Instructor"), async (req, res) => {
  const c = await Course.findById(req.params.id);
  if (!c || String(c.instructor) !== String(req.user._id)) {
    return res.status(404).json({ detail: "Course not found" });
  }
  for (const sid of c.sections || []) {
    const sec = await Section.findById(sid);
    if (sec) await SubSection.deleteMany({ _id: { $in: sec.subsections } });
    await Section.deleteOne({ _id: sid });
  }
  await Course.deleteOne({ _id: c._id });
  await User.updateOne({ _id: req.user._id }, { $pull: { courses: c._id } });
  res.json({ success: true });
});

// Sections
router.post("/section/create", auth, requireRole("Instructor"), async (req, res) => {
  const { courseId, sectionName } = req.body;
  const c = await Course.findById(courseId);
  if (!c || String(c.instructor) !== String(req.user._id)) {
    return res.status(404).json({ detail: "Course not found" });
  }
  const sec = await Section.create({ sectionName });
  await Course.updateOne({ _id: courseId }, { $push: { sections: sec._id } });
  res.json(sec);
});

router.put("/section/update", auth, requireRole("Instructor"), async (req, res) => {
  const { sectionId, sectionName } = req.body;
  await Section.updateOne({ _id: sectionId }, { $set: { sectionName } });
  res.json({ success: true });
});

router.delete("/section/:id", auth, requireRole("Instructor"), async (req, res) => {
  const sec = await Section.findById(req.params.id);
  if (sec) await SubSection.deleteMany({ _id: { $in: sec.subsections } });
  await Section.deleteOne({ _id: req.params.id });
  await Course.updateMany({}, { $pull: { sections: req.params.id } });
  res.json({ success: true });
});

// Subsections
router.post("/subsection/create", auth, requireRole("Instructor"), async (req, res) => {
  const { sectionId, title, description, videoUrl, timeDuration = "0" } = req.body;
  const sub = await SubSection.create({ title, description, videoUrl, timeDuration });
  await Section.updateOne({ _id: sectionId }, { $push: { subsections: sub._id } });
  res.json(sub);
});

router.delete("/subsection/:id", auth, requireRole("Instructor"), async (req, res) => {
  await SubSection.deleteOne({ _id: req.params.id });
  await Section.updateMany({}, { $pull: { subsections: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
