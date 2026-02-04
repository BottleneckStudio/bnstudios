"use strict";

const registry = Object.freeze({
  cors: "./cors",
  helmet: "./helmet",
  authentication: "./authentication",
  rateLimiter: "./rate-limiter",
  idempotency: "./idempotency",
  requestLogging: "./request-logging",
  compression: "./compression",
});

function getMiddlewareFactory(name) {
  const modulePath = registry[name];

  if (!modulePath) {
    return null;
  }

  return require(modulePath);
}

function getRegisteredNames() {
  return Object.keys(registry);
}

module.exports = Object.freeze({
  getMiddlewareFactory,
  getRegisteredNames,
});
