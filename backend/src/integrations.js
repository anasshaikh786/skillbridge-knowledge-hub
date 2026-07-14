const crypto = require("crypto");

// ---------- Email (Resend) ----------
const nodemailer = require("nodemailer");
const dns = require("dns");
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Optional: Debug DNS lookup (not needed for transporter)
dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
  if (err) {
    console.error("DNS Error:", err);
  } else {
    console.log("SMTP DNS resolved to:", addresses);
  }
});

// ✅ USE HOSTNAME, NOT IP ADDRESS
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",  // ← Use hostname, not IP
  port: 587,
  secure: false,           // TLS, not SSL
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
  logger: true,
  debug: true
});

// Test the connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP Connection Failed:", error);
  } else {
    console.log("✅ SMTP Connection Successful!");
  }
});

async function sendEmail(to, subject, html) {
  if (!transporter) {
    console.log(`[MOCK EMAIL] to=${to} subject=${subject}`);
    return { mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SkillBridge" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err) {
    console.error("[Email Error]", err);

    return {
      error: err.message,
    };
  }
}
// ---------- Cloudinary ----------
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const CLOUD_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUD_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const CLOUDINARY_ENABLED = !!(CLOUD_NAME && CLOUD_KEY && CLOUD_SECRET);

let cld = null;
if (CLOUDINARY_ENABLED) {
  cld = require("cloudinary").v2;
  cld.config({ cloud_name: CLOUD_NAME, api_key: CLOUD_KEY, api_secret: CLOUD_SECRET });
}

async function uploadMedia(fileBuffer, mimetype) {
  if (CLOUDINARY_ENABLED) {
    return new Promise((resolve, reject) => {
      const stream = cld.uploader.upload_stream(
        { folder: "skillbridge", resource_type: "auto" },
        (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, type: result.resource_type }))
      );
      stream.end(fileBuffer);
    });
  }
  // MOCK: base64 for small images; sample video URL for videos
  if (mimetype && mimetype.startsWith("image/") && fileBuffer.length < 2_000_000) {
    return {
      url: `data:${mimetype};base64,${fileBuffer.toString("base64")}`,
      type: "image",
      mock: true,
    };
  }
  if (mimetype && mimetype.startsWith("video/")) {
    return {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "video",
      mock: true,
    };
  }
  return { url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800", type: "image", mock: true };
}

// ---------- Razorpay ----------
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_ENABLED = !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
let razorpayClient = null;
if (RAZORPAY_ENABLED) {
  const Razorpay = require("razorpay");
  razorpayClient = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

async function createRazorpayOrder({ amount, currency = "INR", receipt }) {
  if (!RAZORPAY_ENABLED) {
    return { id: `order_mock_${crypto.randomBytes(6).toString("hex")}`, mock: true };
  }
  return await razorpayClient.orders.create({ amount, currency, receipt, payment_capture: 1 });
}

function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!RAZORPAY_ENABLED) return true;
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(payload).digest("hex");
  return expected === signature;
}

module.exports = {
  sendEmail,
  uploadMedia,
  createRazorpayOrder,
  verifyRazorpaySignature,
  RESEND_ENABLED: !!transporter,
  RAZORPAY_ENABLED,
  RAZORPAY_KEY_ID,
};
