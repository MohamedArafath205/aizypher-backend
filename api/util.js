const sha512 = require("js-sha512");
const request = require("request"); // Consider replacing with axios or node-fetch

// Function to make HTTP requests
let curl_call = function (url, data, method = "POST") {
  const options = {
    method: method,
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: data,
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) {
        return reject(error);
      }
      try {
        const data = JSON.parse(response.body);
        return resolve(data);
      } catch (parseError) {
        return reject(parseError);
      }
    });
  });
};

// Function to validate email format
let validate_email = function (mail) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
};

// Function to validate phone number
let validate_phone = function (number) {
  return number.length === 10;
};

// Function to generate SHA-512 hash
let generateHash = function (data, config) {
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

  data.hash = sha512.sha512(hashstring);
  return data.hash;
};

// Function to validate if a number is a float
let validate_float = function (number) {
  return Number(parseFloat(number)) === number;
};

// Function to get base URL based on environment
function get_query_url(env) {
  switch (env) {
    case "prod":
      return "https://dashboard.easebuzz.in/";
    case "test":
      return "https://testpay.easebuzz.in/";
    default:
      return "https://testpay.easebuzz.in/";
  }
}

exports.validate_mail = validate_email;
exports.validate_phone = validate_phone;
exports.generateHash = generateHash;
exports.validate_float = validate_float;
exports.call = curl_call;
exports.get_base_url = get_query_url;
