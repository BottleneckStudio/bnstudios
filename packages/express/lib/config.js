"use strict";

const DEFAULTS = Object.freeze({
  port: 3000,
  baseUrlPath: "/",
  middlewares: [],
  loggerOptions: {},
});

function validateConfig(config) {
  const errors = [];

  if (!config || typeof config !== "object") {
    throw Object.assign(new Error("Configuration must be an object"), { code: "INVALID_CONFIG" });
  }

  if (!config.serviceName || typeof config.serviceName !== "string") {
    errors.push("serviceName is required and must be a string");
  }

  if (config.port !== undefined) {
    if (typeof config.port !== "number" || config.port < 0 || config.port > 65535) {
      errors.push("port must be a number between 0 and 65535");
    }
  }

  if (config.baseUrlPath !== undefined && typeof config.baseUrlPath !== "string") {
    errors.push("baseUrlPath must be a string");
  }

  if (config.middlewares !== undefined && !Array.isArray(config.middlewares)) {
    errors.push("middlewares must be an array");
  }

  if (config.loggerOptions !== undefined && typeof config.loggerOptions !== "object") {
    errors.push("loggerOptions must be an object");
  }

  if (errors.length > 0) {
    throw Object.assign(new Error(`Invalid configuration: ${errors.join(", ")}`), {
      code: "INVALID_CONFIG",
    });
  }
}

function buildServerConfig(userConfig) {
  validateConfig(userConfig);

  return Object.freeze({
    ...DEFAULTS,
    ...userConfig,
    loggerOptions: Object.freeze({
      ...DEFAULTS.loggerOptions,
      ...(userConfig.loggerOptions || {}),
      serviceName: userConfig.serviceName,
    }),
    middlewares: Object.freeze([...(userConfig.middlewares || DEFAULTS.middlewares)]),
  });
}

module.exports = Object.freeze({
  DEFAULTS,
  validateConfig,
  buildServerConfig,
});
