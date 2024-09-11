require("dotenv").config();
const sha512 = require("js-sha512");
const express = require("express");
const cors = require("cors"); // Import the cors package
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files
app.use("/static", express.static(path.join(__dirname, "assets")));
app.use("/view", express.static(path.join(__dirname, "views")));

// View engine
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

// Configuration
const config = {
  key: process.env.EASEBUZZ_KEY,
  salt: process.env.EASEBUZZ_SALT,
  env: process.env.EASEBUZZ_ENV,
  enable_iframe: process.env.EASEBUZZ_IFRAME,
};

// Routes
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Response route
app.post("/response", function (req, res) {
  function checkReverseHash(response) {
    const hashstring = [
      config.salt,
      response.status,
      response.udf10,
      response.udf9,
      response.udf8,
      response.udf7,
      response.udf6,
      response.udf5,
      response.udf4,
      response.udf3,
      response.udf2,
      response.udf1,
      response.email,
      response.firstname,
      response.productinfo,
      response.amount,
      response.txnid,
      response.key,
    ].join("|");
    const hash_key = sha512.sha512(hashstring);
    return hash_key === req.body.hash;
  }
  if (checkReverseHash(req.body)) {
    res.send(req.body);
  } else {
    res.send("false, check the hash value");
  }
});

// Initiate Payment API
app.post("/initiate_payment", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  const data = req.body;
  const initiate_payment = require("./Easebuzz/initiate_payment.js");
  initiate_payment.initiate_payment(data, config, res);
});

// Transaction API
app.post("/transaction", function (req, res) {
  const data = req.body;
  const transaction = require("./Easebuzz/transaction.js");
  transaction.transaction(data, config, res);
});

// Transaction Date API
app.post("/transaction_date", function (req, res) {
  const data = req.body;
  const transaction_date = require("./Easebuzz/tranaction_date.js");
  transaction_date.tranaction_date(data, config, res);
});

// Payout API
app.post("/payout", function (req, res) {
  const data = req.body;
  const payout = require("./Easebuzz/payout.js");
  payout.payout(data, config, res);
});

// Refund API
app.post("/refund", function (req, res) {
  const data = req.body;
  const refund = require("./Easebuzz/refund.js");
  refund.refund(data, config, res);
});

app.listen(3000, () => {
  console.log("Easebuzz Payment Kit Demo server started at port 3000");
});
