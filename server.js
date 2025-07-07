const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thanks for Subscribing!",
    text: `Hi ${
      name || "Reader"
    },\n\nThank you for subscribing. Kindly confirm your email by replying to this mail.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Confirmation email sent!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email", error: err });
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
      to: email,
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
