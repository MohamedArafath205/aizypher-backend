require("dotenv").config();
const sha512 = require("js-sha512");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your client's origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "X-CSRF-Token",
    "X-Requested-With",
    "Accept",
    "Accept-Version",
    "Content-Length",
    "Content-MD5",
    "Content-Type",
    "Date",
    "X-Api-Version",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Middleware
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Static files
app.use("/static", express.static(path.join(__dirname, "assets")));
app.use("/view", express.static(path.join(__dirname, "views")));

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

// Utility function to check reverse hash
function checkReverseHash(response) {
  const hashstring = `${config.salt}|${response.status}|${response.udf10}|${response.udf9}|${response.udf8}|${response.udf7}|${response.udf6}|${response.udf5}|${response.udf4}|${response.udf3}|${response.udf2}|${response.udf1}|${response.email}|${response.firstname}|${response.productinfo}|${response.amount}|${response.txnid}|${response.key}`;
  const hash_key = sha512.sha512(hashstring);
  return hash_key === response.hash;
}

// Response route
app.post("/response", (req, res) => {
  if (checkReverseHash(req.body)) {
    res.json(req.body);
  } else {
    res.status(400).send("Invalid hash value");
  }
});

// Initiate Payment API
app.post("/api/initiate_payment", async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  const data = req.body;
  try {
    const initiate_payment = require("./initiate_payment.js");
    await initiate_payment.initiate_payment(data, config, res);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Transaction API
app.post("/transaction", (req, res) => {
  const data = req.body;
  try {
    const transaction = require("./transaction.js");
    transaction.transaction(data, config, res);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Transaction Date API
app.post("/transaction_date", (req, res) => {
  const data = req.body;
  try {
    const transaction_date = require("./transaction_date.js");
    transaction_date.transaction_date(data, config, res);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Payout API
app.post("/payout", (req, res) => {
  const data = req.body;
  try {
    const payout = require("./payout.js");
    payout.payout(data, config, res);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Refund API
app.post("/refund", (req, res) => {
  const data = req.body;
  try {
    const refund = require("./refund.js");
    refund.refund(data, config, res);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Easebuzz Payment Kit Demo server started at port ${PORT}`);
});
