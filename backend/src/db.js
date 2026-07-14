const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");

async function connectDB() {
  const url = process.env.MONGO_URL;
  if (!url) throw new Error("MONGO_URL missing in env");
  await mongoose.connect(url);
  console.log("MongoDB connected");
}

module.exports = { connectDB };
