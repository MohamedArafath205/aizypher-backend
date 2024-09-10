require("dotenv").config();
const sha512 = require("js-sha512");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

// Create Express app
const app = express();

// CORS middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["*"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Static files
app.use("/static", express.static(path.join(__dirname, "assets")));
app.use("/view", express.static(path.join(__dirname, "views")));

// View engine setup
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

// Configuration for payment
const config = {
  key: process.env.EASEBUZZ_KEY,
  salt: process.env.EASEBUZZ_SALT,
  env: process.env.EASEBUZZ_ENV,
  enable_iframe: process.env.EASEBUZZ_IFRAME,
};

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Payment routes
app.post("/api/initiate_payment", async (req, res) => {
  const data = req.body;
  const initiate_payment = require("./initiate_payment.js");
  initiate_payment.initiate_payment(data, config, res);
});

// Transaction routes
app.post("/transaction", (req, res) => {
  const data = req.body;
  const transaction = require("./transaction.js");
  transaction.transaction(data, config, res);
});

app.post("/transaction_date", (req, res) => {
  const data = req.body;
  const transaction_date = require("./transaction_date.js");
  transaction_date.transaction_date(data, config, res);
});

app.post("/payout", (req, res) => {
  const data = req.body;
  const payout = require("./payout.js");
  payout.payout(data, config, res);
});

app.post("/refund", (req, res) => {
  const data = req.body;
  const refund = require("./refund.js");
  refund.refund(data, config, res);
});

// Email sending route
app.post("/api/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  // Check if 'to' field is present
  if (!to) {
    return res.status(400).send("Recipient email (to) is required");
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.HOST_FROM,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).send("Error sending email: " + error.message);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
