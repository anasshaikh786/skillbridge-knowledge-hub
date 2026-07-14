const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("./models");

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const JWT_EXPIRE_HOURS = parseInt(process.env.JWT_EXPIRE_HOURS || "72", 10);

function makeToken(userId, role) {
  return jwt.sign({ sub: String(userId), role }, JWT_SECRET, {
    expiresIn: `${JWT_EXPIRE_HOURS}h`,
  });
}

function hashPassword(pw) {
  return bcrypt.hashSync(pw, 10);
}
function verifyPassword(pw, hash) {
  try { return bcrypt.compareSync(pw, hash); } catch { return false; }
}

async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ detail: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).select("-password_hash").lean();
    if (!user) return res.status(401).json({ detail: "User not found" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: "Invalid token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ detail: "Forbidden" });
    }
    next();
  };
}

module.exports = { makeToken, hashPassword, verifyPassword, auth, requireRole };
