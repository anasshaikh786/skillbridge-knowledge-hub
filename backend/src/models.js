const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const profileSchema = new Schema({
  gender: String,
  dob: String,
  about: { type: String, default: "" },
  contactNumber: { type: String, default: "" },
}, { timestamps: true });

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["Student", "Instructor"], required: true },
  image: String,
  profile: { type: Schema.Types.ObjectId, ref: "Profile" },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  cart: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Course" }],
}, { timestamps: true });

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
}, { timestamps: true });

const subSectionSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  timeDuration: { type: String, default: "0" },
}, { timestamps: true });

const sectionSchema = new Schema({
  sectionName: { type: String, required: true },
  subsections: [{ type: Schema.Types.ObjectId, ref: "SubSection" }],
}, { timestamps: true });

const courseSchema = new Schema({
  courseName: { type: String, required: true },
  courseDescription: String,
  whatYouWillLearn: String,
  price: { type: Number, default: 0 },
  instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  thumbnail: String,
  tags: [String],
  instructions: [String],
  sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
  studentsEnrolled: [{ type: Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
}, { timestamps: true });

const ratingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: String,
}, { timestamps: true });

const otpSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const resetTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const orderSchema = new Schema({
  orderId: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  amount: Number,
  status: { type: String, default: "created" },
  mock: { type: Boolean, default: false },
  paymentId: String,
}, { timestamps: true });

const progressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  completedVideos: [{ type: Schema.Types.ObjectId, ref: "SubSection" }],
}, { timestamps: true });
progressSchema.index({ user: 1, course: 1 }, { unique: true });

const Profile = model("Profile", profileSchema);
const User = model("User", userSchema);
const Category = model("Category", categorySchema);
const SubSection = model("SubSection", subSectionSchema);
const Section = model("Section", sectionSchema);
const Course = model("Course", courseSchema);
const Rating = model("Rating", ratingSchema);
const OTP = model("OTP", otpSchema);
const ResetToken = model("ResetToken", resetTokenSchema);
const Order = model("Order", orderSchema);
const Progress = model("Progress", progressSchema);

async function seedCategories() {
  const defaults = [
    { name: "Web Development", description: "Modern web development skills." },
    { name: "Data Science", description: "Stats, ML and analytics." },
    { name: "Design", description: "UI/UX and creative tools." },
    { name: "Business", description: "Entrepreneurship and marketing." },
    { name: "AI & ML", description: "Deep learning and applied AI." },
    { name: "Mobile Apps", description: "iOS, Android and cross-platform." },
  ];
  const inserted = [];
  for (const d of defaults) {
    const exists = await Category.findOne({ name: d.name });
    if (!exists) {
      await Category.create(d);
      inserted.push(d.name);
    }
  }
  return inserted;
}

module.exports = {
  Profile, User, Category, SubSection, Section, Course, Rating,
  OTP, ResetToken, Order, Progress, seedCategories,
};
