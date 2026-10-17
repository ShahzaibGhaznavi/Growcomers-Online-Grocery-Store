require("dotenv").config();

const mongoose = require("mongoose");
const userModel = require("./models/userModel");
const { generateToken } = require("./middlewares/generateToken");
const sendMail = require("./utils/sendGrid");

async function main() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, { dbName: "MainDB" });
    console.log("MongoDB connected");

    const email = "shahzaibazeem558@gmail.com";
    const user = await userModel.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      console.log("User not found. Email address or database needs checking.");
      return;
    }

    if (user.isVerified) {
      console.log("This account is already verified.");
      return;
    }

    const token = generateToken({
      userId: user._id,
      role: user.role
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const verificationUrl =
      `${clientUrl}/verify?token=${encodeURIComponent(token)}`;

    const content = `
      <div>
        <h2>Verify your Growcomers account</h2>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>If needed, copy this link into your browser:</p>
        <p>${verificationUrl}</p>
      </div>
    `;

    await sendMail({
      email: user.email,
      subject: "Verify your Growcomers account",
      content
    });

    console.log("Verification email generated for:", user.email);
    console.log("Open the Ethereal Preview URL printed above.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error("Verification email generation failed:", error.message);
  process.exitCode = 1;
});
