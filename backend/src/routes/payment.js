const express = require("express");
const { Course, Order, Progress } = require("../models");
const { auth } = require("../middleware");
const { createRazorpayOrder, verifyRazorpaySignature, RAZORPAY_KEY_ID, RAZORPAY_ENABLED, sendEmail } = require("../integrations");
const crypto = require("crypto");

const router = express.Router();

router.post("/create-order", auth, async (req, res) => {
  const { courseIds } = req.body;
  if (!courseIds || courseIds.length === 0) return res.status(400).json({ detail: "No courses selected" });

  let total = 0;
  const validIds = [];
  for (const id of courseIds) {
    const c = await Course.findById(id);
    if (!c) continue;
    if ((c.studentsEnrolled || []).some(u => String(u) === String(req.user._id))) {
      return res.status(400).json({ detail: "Already enrolled in a course in cart" });
    }
    total += Number(c.price || 0);
    validIds.push(id);
  }
  if (!validIds.length) return res.status(400).json({ detail: "No valid courses" });

  const amountPaise = Math.max(1, Math.round(total * 100));
  const rzpOrder = await createRazorpayOrder({
    amount: amountPaise, currency: "INR", receipt: `sb_${crypto.randomBytes(4).toString("hex")}`,
  });

  await Order.create({
    orderId: rzpOrder.id, user: req.user._id, courses: validIds,
    amount: amountPaise, status: "created", mock: !!rzpOrder.mock,
  });

  res.json({
    orderId: rzpOrder.id,
    amount: amountPaise,
    currency: "INR",
    key: RAZORPAY_KEY_ID || "rzp_test_mock",
    mock: !RAZORPAY_ENABLED,
    courseIds: validIds,
  });
});

router.post("/verify", auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseIds } = req.body;
  const order = await Order.findOne({ orderId: razorpay_order_id, user: req.user._id });
  if (!order) return res.status(404).json({ detail: "Order not found" });

  const valid = order.mock ? true : verifyRazorpaySignature({
    orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature,
  });
  if (!valid) {
    order.status = "failed"; await order.save();
    return res.status(400).json({ detail: "Signature verification failed" });
  }

  for (const cid of courseIds) {
    await Course.updateOne({ _id: cid }, { $addToSet: { studentsEnrolled: req.user._id } });
    await Progress.updateOne(
      { user: req.user._id, course: cid },
      { $setOnInsert: { user: req.user._id, course: cid, completedVideos: [] } },
      { upsert: true }
    );
  }
  order.status = "paid"; order.paymentId = razorpay_payment_id; await order.save();

  sendEmail(req.user.email, "Enrollment Successful — SkillBridge",
    `<div style="font-family:Inter"><h2>Welcome aboard!</h2><p>You've enrolled in ${courseIds.length} course(s). Happy learning!</p></div>`);

  res.json({ success: true, enrolled: courseIds });
});

module.exports = router;
