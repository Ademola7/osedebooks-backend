const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");
const mysql = require("mysql2");
const connection = require("./db");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

//cors
const allowedOrigins = ["https://osedebooks.com", "https://www.osedebooks.com"];

// MySQL connection
const db = mysql.createConnection({
  host: "caixq00js.mysql.service.one.com",
  user: "caixq00js_osedebooks",
  password: process.env.dbpassword,
  database: "caixq00js_osedebooks",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Newsletter route
app.post("/subscribe", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "Both name and email are required." });
  }

  // 1. Send confirmation to user
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thanks for Subscribing!",
    text: `Hi ${name},\n\nThank you for subscribing to Osede Books. Stay tuned for offers, updates, and exciting news!\n\nWarm regards,\nOsede Books Team`,
  };

  // 2. Notify Admin
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Newsletter Subscriber",
    text: `New subscriber:\n\nName: ${name}\nEmail: ${email}`,
  };

  try {
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(200).json({ message: "Subscription successful!" });
  } catch (err) {
    console.error("Newsletter error:", err);
    res.status(500).json({ message: "Subscription failed", error: err });
  }
});

// Contact

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const mailOptionsToAdmin = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Contact Message from Osede Books",
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
  };

  const autoReplyToUser = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "We received your message",
    text: `Hi ${name},\n\nThank you for contacting Osede Books. We'll get back to you shortly.\n\nBest regards,\nOsede Books Team`,
  };

  try {
    await transporter.sendMail(mailOptionsToAdmin);
    await transporter.sendMail(autoReplyToUser); // optional but nice UX

    res.status(200).json({ message: "Message sent successfully." });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ message: "Failed to send message.", error: err });
  }
});

// Manuscript submission route
app.post(
  "/submit-manuscript",
  upload.single("manuscript"),
  async (req, res) => {
    const { name, email } = req.body;
    const file = req.file;

    if (!file) return res.status(400).send("No file uploaded.");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // recipient
      subject: "Manuscript Received",
      text: `Hi ${name},\n\nWe have received your manuscript titled "${file.originalname}". Thank you for submitting to OSEDE Books.`,
      attachments: [{ path: file.path }],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Manuscript submitted successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Submission failed", error: err });
    }
  }
);

app.listen(port, () => console.log(`Server running on port ${port}`));
