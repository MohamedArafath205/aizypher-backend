require("dotenv").config();
const sha512 = require("js-sha512");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Use CORS middleware
app.use(cors());

const corsOptions = {
  origin: "*",
  methods: "GET,POST",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

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

// Response route
app.post("/response", (req, res) => {
  function checkReverseHash(response) {
    const hashstring = `${config.salt}|${response.status}|${response.udf10}|${response.udf9}|${response.udf8}|${response.udf7}|${response.udf6}|${response.udf5}|${response.udf4}|${response.udf3}|${response.udf2}|${response.udf1}|${response.email}|${response.firstname}|${response.productinfo}|${response.amount}|${response.txnid}|${response.key}`;
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
app.post("/initiate_payment", async (req, res) => {
  const data = req.body;
  const initiate_payment = require("./initiate_payment.js");
  initiate_payment.initiate_payment(data, config, res);
});

// Transaction API
app.post("/transaction", (req, res) => {
  const data = req.body;
  const transaction = require("./transaction.js"); // Fixed path
  transaction.transaction(data, config, res);
});

// Transaction Date API
app.post("/transaction_date", (req, res) => {
  const data = req.body;
  const transaction_date = require("./transaction_date.js"); // Fixed path and spelling
  transaction_date.transaction_date(data, config, res);
});

// Payout API
app.post("/payout", (req, res) => {
  const data = req.body;
  const payout = require("./payout.js"); // Fixed path
  payout.payout(data, config, res);
});

// Refund API
app.post("/refund", (req, res) => {
  const data = req.body;
  const refund = require("./refund.js"); // Fixed path
  refund.refund(data, config, res);
});

// Start the server
app.listen(3000, () => {
  console.log("Easebuzz Payment Kit Demo server started at port 3001");
});
