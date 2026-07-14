const express = require("express");
const { Course, Rating } = require("../models");
const { auth, requireRole } = require("../middleware");

const router = express.Router();

router.get("/stats", auth, requireRole("Instructor"), async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).lean();
  const totalStudents = courses.reduce((a, c) => a + (c.studentsEnrolled || []).length, 0);
  const totalRevenue = courses.reduce((a, c) => a + (c.studentsEnrolled || []).length * Number(c.price || 0), 0);

  const allRatings = [];
  const perCourse = [];
  for (const c of courses) {
    const rs = await Rating.find({ course: c._id }).lean();
    allRatings.push(...rs);
    const rev = (c.studentsEnrolled || []).length * Number(c.price || 0);
    perCourse.push({
      id: String(c._id),
      name: c.courseName,
      students: (c.studentsEnrolled || []).length,
      revenue: rev,
      avgRating: rs.length ? Math.round((rs.reduce((a, r) => a + r.rating, 0) / rs.length) * 10) / 10 : 0,
      thumbnail: c.thumbnail,
      status: c.status,
    });
  }
  const avgRating = allRatings.length ? Math.round((allRatings.reduce((a, r) => a + r.rating, 0) / allRatings.length) * 10) / 10 : 0;

  res.json({
    totalCourses: courses.length,
    totalStudents,
    totalRevenue,
    avgRating,
    perCourse,
  });
});

module.exports = router;
