const nodemailer = require("nodemailer");

let transporter;

const createTransporter = async () => {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

const sendMail = async ({ email, subject, content }) => {
  try {
    const mailer = await createTransporter();

    const info = await mailer.sendMail({
      from: '"Growcomers" <no-reply@growcomers.local>',
      to: email,
      subject,
      html: content,
    });

    console.log("Email sent:", info.messageId);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log("Preview URL:", previewUrl);
    }
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = sendMail;