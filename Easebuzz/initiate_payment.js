// Easebuzz/initiate_payment.js
const sha512 = require("js-sha512");
const util = require("./util.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ status: 0, message: "Method Not Allowed" });
  }

  const data = req.body;

  function isFloat(amt) {
    const regexp = /^\d+\.\d{1,2}$/;
    return regexp.test(amt);
  }

  function checkArgumentValidation(data) {
    if (!data.name.trim()) {
      return { status: 0, message: "Mandatory Parameter name cannot be empty" };
    }
    if (!data.amount.trim() || !isFloat(data.amount)) {
      return {
        status: 0,
        message:
          "Mandatory Parameter amount cannot be empty and must be in decimal",
      };
    }
    if (!data.txnid.trim()) {
      return {
        status: 0,
        message:
          "Merchant Transaction validation failed. Please enter proper value for merchant txn",
      };
    }
    if (!data.email.trim() || !util.validate_mail(data.email)) {
      return {
        status: 0,
        message: "Email validation failed. Please enter proper value for email",
      };
    }
    if (!data.phone.trim() || !util.validate_phone(data.phone)) {
      return {
        status: 0,
        message: "Phone validation failed. Please enter proper value for phone",
      };
    }
    if (!data.productinfo.trim()) {
      return {
        status: 0,
        message: "Mandatory Parameter Product info cannot be empty",
      };
    }
    if (!data.surl.trim() || !data.furl.trim()) {
      return {
        status: 0,
        message: "Mandatory Parameter Surl/Furl cannot be empty",
      };
    }
    return null;
  }

  function geturl(env) {
    switch (env) {
      case "test":
        return "https://testpay.easebuzz.in/";
      case "prod":
        return "https://pay.easebuzz.in/";
      default:
        return "https://testpay.easebuzz.in/";
    }
  }

  function generateHash() {
    const hashstring = [
      config.key,
      data.txnid,
      data.amount,
      data.productinfo,
      data.name,
      data.email,
      data.udf1 || "",
      data.udf2 || "",
      data.udf3 || "",
      data.udf4 || "",
      data.udf5 || "",
      data.udf6 || "",
      data.udf7 || "",
      data.udf8 || "",
      data.udf9 || "",
      data.udf10 || "",
      config.salt,
    ].join("|");

    return sha512.sha512(hashstring);
  }

  const validationError = checkArgumentValidation(data);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  const hash_key = generateHash();
  const payment_url = geturl(config.env);
  const call_url = `${payment_url}payment/initiateLink`;

  const form = {
    key: config.key,
    txnid: data.txnid,
    amount: data.amount,
    email: data.email,
    phone: data.phone,
    firstname: data.name,
    udf1: data.udf1 || "",
    udf2: data.udf2 || "",
    udf3: data.udf3 || "",
    udf4: data.udf4 || "",
    udf5: data.udf5 || "",
    hash: hash_key,
    productinfo: data.productinfo,
    udf6: data.udf6 || "",
    udf7: data.udf7 || "",
    udf8: data.udf8 || "",
    udf9: data.udf9 || "",
    udf10: data.udf10 || "",
    furl: data.furl,
    surl: data.surl,
  };

  if (data.unique_id) form.unique_id = data.unique_id;
  if (data.split_payments) form.split_payments = data.split_payments;
  if (data.sub_merchant_id) form.sub_merchant_id = data.sub_merchant_id;
  if (data.customer_authentication_id)
    form.customer_authentication_id = data.customer_authentication_id;

  try {
    const response = await util.call(call_url, form);

    if (config.enable_iframe === 0) {
      const url = `${payment_url}pay/${response.data}`;
      return res.redirect(url);
    } else {
      return res.render("enable_iframe.html", {
        key: config.key,
        access_key: response.data,
      });
    }
  } catch (error) {
    console.error("Error during payment initiation:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
