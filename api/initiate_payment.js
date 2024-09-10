const sha512 = require("js-sha512");
const util = require("./util.js");

module.exports = async (req, res) => {
  const data = req.body;
  const config = {
    key: process.env.EASEBUZZ_KEY,
    salt: process.env.EASEBUZZ_SALT,
    env: process.env.EASEBUZZ_ENV,
    enable_iframe: process.env.EASEBUZZ_IFRAME,
  };

  // Helper function to check if a value is a valid float
  function isFloat(amt) {
    return /^\d+\.\d{1,2}$/.test(amt);
  }

  // Validate the arguments provided
  function checkArgumentValidation(data, config) {
    if (!data.name.trim()) {
      return res
        .status(400)
        .json({
          status: 0,
          data: "Mandatory Parameter 'name' cannot be empty",
        });
    }
    if (!data.amount.trim() || !isFloat(data.amount)) {
      return res
        .status(400)
        .json({
          status: 0,
          data: "Mandatory Parameter 'amount' cannot be empty and must be a decimal",
        });
    }
    if (!data.txnid.trim()) {
      return res
        .status(400)
        .json({
          status: 0,
          data: "Merchant Transaction validation failed. Please enter a valid value for 'txnid'",
        });
    }
    if (!data.email.trim() || !util.validate_mail(data.email)) {
      return res
        .status(400)
        .json({
          status: 0,
          data: "Email validation failed. Please enter a valid value for 'email'",
        });
    }
    if (!data.phone.trim() || !util.validate_phone(data.phone)) {
      return res
        .status(400)
        .json({
          status: 0,
          data: "Phone validation failed. Please enter a valid value for 'phone'",
        });
    }
    if (!data.productinfo.trim()) {
      return res
        .status(400)
        .json({
          status: 0,
          data: "Mandatory Parameter 'productinfo' cannot be empty",
        });
    }
    if (!data.surl.trim() || !data.furl.trim()) {
      return res
        .status(400)
        .json({
          status: 0,
          data: "Mandatory Parameter 'surl'/'furl' cannot be empty",
        });
    }
  }

  // Get the payment URL based on the environment
  function getUrl(env) {
    switch (env) {
      case "prod":
        return "https://pay.easebuzz.in/";
      case "test":
      default:
        return "https://testpay.easebuzz.in/";
    }
  }

  // Generate the form data
  function generateForm(hash_key) {
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

    // Add optional parameters if they exist
    if (data.unique_id) form.unique_id = data.unique_id;
    if (data.split_payments) form.split_payments = data.split_payments;
    if (data.sub_merchant_id) form.sub_merchant_id = data.sub_merchant_id;
    if (data.customer_authentication_id)
      form.customer_authentication_id = data.customer_authentication_id;

    return form;
  }

  // Generate the hash for the payment
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

  try {
    // Validate input data
    const validationError = checkArgumentValidation(data, config);
    if (validationError) return;

    // Generate hash and prepare payment URL
    const hash_key = generateHash();
    const payment_url = getUrl(config.env);
    const call_url = payment_url + "payment/initiateLink";

    // Generate form data and initiate payment
    const formData = generateForm(hash_key);
    const response = await util.call(call_url, formData);

    // Redirect to payment URL
    const pay_url = `${payment_url}pay/${response.data}`;
    res.redirect(pay_url);
  } catch (error) {
    res
      .status(500)
      .json({ status: 0, data: "Internal Server Error: " + error.message });
  }
};
