// routes/newsletter.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post("/", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "Name and email are required." });

  try {
    // Send confirmation to user
    await transporter.sendMail({
      from: `"Osede Books" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Thanks for subscribing!",
      html: `<p>Hi ${name},</p><p>Thanks for subscribing to Osede Books newsletter! Stay tuned for exciting updates and offers.</p>`,
    });

    // Notify admin
    await transporter.sendMail({
      from: `"Osede Books" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Newsletter Subscriber",
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p>`,
    });

    return res.status(200).json({ message: "Subscription successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
