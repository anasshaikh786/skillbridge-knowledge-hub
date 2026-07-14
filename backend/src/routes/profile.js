const express = require("express");
const { User, Profile } = require("../models");
const { auth, hashPassword, verifyPassword } = require("../middleware");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const profile = await Profile.findById(req.user.profile).lean();
  res.json({ user: req.user, profile });
});

router.put("/update", auth, async (req, res) => {
  const { firstName, lastName, gender, dob, about, contactNumber } = req.body;
  const uFields = {}; const pFields = {};
  if (firstName !== undefined) uFields.firstName = firstName;
  if (lastName !== undefined) uFields.lastName = lastName;
  if (gender !== undefined) pFields.gender = gender;
  if (dob !== undefined) pFields.dob = dob;
  if (about !== undefined) pFields.about = about;
  if (contactNumber !== undefined) pFields.contactNumber = contactNumber;
  if (Object.keys(uFields).length) await User.updateOne({ _id: req.user._id }, { $set: uFields });
  if (Object.keys(pFields).length) await Profile.updateOne({ _id: req.user.profile }, { $set: pFields });
  res.json({ success: true });
});

router.put("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const full = await User.findById(req.user._id);
  if (!verifyPassword(oldPassword, full.password_hash)) {
    return res.status(400).json({ detail: "Old password incorrect" });
  }
  full.password_hash = hashPassword(newPassword);
  await full.save();
  res.json({ success: true });
});

router.delete("/delete", auth, async (req, res) => {
  await User.deleteOne({ _id: req.user._id });
  await Profile.deleteOne({ _id: req.user.profile });
  res.json({ success: true });
});

module.exports = router;
