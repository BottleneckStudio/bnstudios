"use strict";

const { createLogger } = require("./lib/logger");
const { requestLogger } = require("./lib/request-logger");

const defaultLogger = createLogger();

module.exports = Object.freeze({
  ...defaultLogger,
  createLogger,
  createRequestLogger: requestLogger,
});
