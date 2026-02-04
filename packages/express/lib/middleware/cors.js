"use strict";

const cors = require("cors");

function create(options = {}) {
  const origin = options.origin || "*";
  const credentials = origin === "*" ? false : options.credentials !== false;

  const corsOptions = {
    origin,
    methods: options.methods || ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: options.allowedHeaders || ["Content-Type", "Authorization"],
    credentials,
  };

  return cors(corsOptions);
}

module.exports = Object.freeze({ create });
