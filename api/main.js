require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// CORS middleware
app.use(
  cors({
    origin: "*", // Adjust as needed
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
