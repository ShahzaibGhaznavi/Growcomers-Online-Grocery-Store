const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "MainDB",
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Database Connected on MongoDB");
});

db.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});

module.exports = db;