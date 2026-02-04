"use strict";

const { createRequestLogger } = require("@bnstudios/logger");

function create(options = {}, context = {}) {
  const { logger } = context;

  if (!logger) {
    throw new Error("Logger is required for request logging middleware");
  }

  return createRequestLogger(logger);
}

module.exports = Object.freeze({ create });
