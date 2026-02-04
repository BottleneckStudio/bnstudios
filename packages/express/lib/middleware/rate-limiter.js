"use strict";

const rateLimit = require("express-rate-limit");

function create(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    limit = 100,
    standardHeaders = "draft-8",
    legacyHeaders = false,
    excludePaths = [],
    message = { error: "Too many requests, please try again later" },
  } = options;

  const skip = (req) => {
    return excludePaths.some((p) => req.path === p || req.path.startsWith(p + "/"));
  };

  return rateLimit({
    windowMs,
    limit,
    standardHeaders,
    legacyHeaders,
    message,
    skip,
  });
}

module.exports = Object.freeze({ create });
