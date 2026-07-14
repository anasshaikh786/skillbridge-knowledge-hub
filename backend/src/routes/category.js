const express = require("express");
const { Category, Course } = require("../models");
const { auth, requireRole } = require("../middleware");

const router = express.Router();

router.post("/create", auth, requireRole("Instructor"), async (req, res) => {
  const { name, description = "" } = req.body;
  const cat = await Category.create({ name, description });
  res.json(cat);
});

router.get("/all", async (req, res) => {
  const cats = await Category.find().lean();
  res.json(cats);
});

router.get("/:id/page", async (req, res) => {
  const cat = await Category.findById(req.params.id).lean();
  if (!cat) return res.status(404).json({ detail: "Category not found" });
  const courses = await Course.find({ category: req.params.id, status: "Published" }).lean();
  const otherCourses = await Course.find({ category: { $ne: req.params.id }, status: "Published" }).limit(50).lean();
  res.json({ category: cat, courses, otherCourses });
});

module.exports = router;
