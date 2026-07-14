const express = require("express");
const crypto = require("crypto");
const { User, Profile, OTP, ResetToken } = require("../models");
const { makeToken, hashPassword, verifyPassword } = require("../middleware");
const { sendEmail, RESEND_ENABLED } = require("../integrations");

const router = express.Router();

function randOtp() {
  return String(crypto.randomInt(0, 999999)).padStart(6, "0");
}

router.post("/send-otp", async (req, res) => {
    console.log("====== SEND OTP HIT ======");
  console.log("Body:", req.body);
  const { email } = req.body;
  if (!email) return res.status(400).json({ detail: "Email required" });
  const lower = email.toLowerCase();
  const exists = await User.findOne({ email: lower });
  if (exists) return res.status(400).json({ detail: "User already registered" });

  const code = randOtp();
  await OTP.deleteMany({ email: lower });
  await OTP.create({ email: lower, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

  const html = `<div style="font-family:Inter;padding:20px">
    <h2>Verify your email</h2>
    <p>Your SkillBridge OTP is:</p>
    <p style="font-size:28px;font-weight:800;letter-spacing:6px">${code}</p>
    <p>Expires in 10 minutes.</p>
  </div>`;
  console.log("Calling sendEmail...");
const result = await sendEmail(
  email,
  "Your SkillBridge Verification Code",
  html
);

console.log("Resend result:", result);
console.log("sendEmail completed");
  const resp = { success: true, message: "OTP sent" };
  if (!RESEND_ENABLED) resp.dev_otp = code;
  res.json(resp);
});

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;
  if (!firstName || !lastName || !email || !password || !accountType || !otp) {
    return res.status(400).json({ detail: "Missing fields" });
  }
  if (password !== confirmPassword) return res.status(400).json({ detail: "Passwords do not match" });
  if (!["Student", "Instructor"].includes(accountType)) return res.status(400).json({ detail: "Invalid account type" });

  const lower = email.toLowerCase();
  const otpDoc = await OTP.findOne({ email: lower }).sort({ createdAt: -1 });
  if (!otpDoc || otpDoc.code !== otp) return res.status(400).json({ detail: "Invalid OTP" });
  if (otpDoc.expiresAt < new Date()) return res.status(400).json({ detail: "OTP expired" });
  if (await User.findOne({ email: lower })) return res.status(400).json({ detail: "User already exists" });

  const profile = await Profile.create({ contactNumber: contactNumber || "" });
  const image = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(firstName + " " + lastName)}`;
  const user = await User.create({
    firstName, lastName, email: lower, password_hash: hashPassword(password),
    role: accountType, image, profile: profile._id,
  });
  await OTP.deleteMany({ email: lower });

  const token = makeToken(user._id, accountType);
  const userObj = user.toObject();
  delete userObj.password_hash;
  res.json({ success: true, token, user: userObj });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ detail: "Invalid email or password" });
  }
  const token = makeToken(user._id, user.role);
  const userObj = user.toObject();
  delete userObj.password_hash;
  res.json({ success: true, token, user: userObj });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user) return res.json({ success: true, message: "If the email exists, a reset link has been sent" });

  const raw = crypto.randomBytes(32).toString("base64url");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  await ResetToken.deleteMany({ user: user._id });
  await ResetToken.create({ user: user._id, tokenHash: hash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });

  const link = `${process.env.FRONTEND_URL}/reset-password?token=${raw}`;
  const html = `<div style="font-family:Inter;padding:20px">
    <h2>Password Reset</h2>
    <p>Click the link (expires in 30 min):</p>
    <p><a href="${link}" style="background:#FFD60A;color:#000;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Reset Password</a></p>
    <p>Or copy: ${link}</p>
  </div>`;
  sendEmail(email, "SkillBridge Password Reset", html);

  const resp = { success: true, message: "Reset email sent" };
  if (!RESEND_ENABLED) resp.dev_token = raw;
  res.json(resp);
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ detail: "Missing fields" });
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const doc = await ResetToken.findOne({ tokenHash: hash });
  if (!doc || doc.expiresAt < new Date()) return res.status(400).json({ detail: "Invalid or expired token" });
  await User.updateOne({ _id: doc.user }, { $set: { password_hash: hashPassword(password) } });
  await ResetToken.deleteMany({ user: doc.user });
  res.json({ success: true, message: "Password reset" });
});

module.exports = router;
