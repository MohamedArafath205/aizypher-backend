require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const sha512 = require("js-sha512");

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

// Configuration
const config = {
  key: process.env.EASEBUZZ_KEY,
  salt: process.env.EASEBUZZ_SALT,
  env: process.env.EASEBUZZ_ENV,
  enable_iframe: process.env.EASEBUZZ_IFRAME,
};

// Example route
app.post("/api/initiate_payment", async (req, res) => {res.setHeader("Access-Control-Allow-Credentials", true);
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Easebuzz Payment Kit Demo server started at port ${PORT}`);
});
