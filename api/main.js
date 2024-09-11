require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const sha512 = require("js-sha512");

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your frontend URL
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// View engine setup
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

// Configuration
const config = {
  key: process.env.EASEBUZZ_KEY,
  salt: process.env.EASEBUZZ_SALT,
  env: process.env.EASEBUZZ_ENV,
  enable_iframe: process.env.EASEBUZZ_IFRAME,
};

// Example route
app.post("/api/initiate_payment", async (req, res) => {
  const data = req.body;
  try {
    const initiate_payment = require("./initiate_payment.js");
    await initiate_payment.initiate_payment(data, config, res);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Easebuzz Payment Kit Demo server started at port ${PORT}`);
});
