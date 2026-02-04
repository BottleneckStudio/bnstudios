"use strict";

const pino = require("pino");
const { buildLoggerConfig } = require("./config");
const { createStream } = require("./streams");

function createLoggerInstance(config) {
  const pinoOptions = {
    level: config.level,
    timestamp: pino.stdTimeFunctions.isoTime,
    base: { service: config.serviceName },
  };

  const stream = createStream({
    logFile: config.logFile,
    prettyPrint: config.prettyPrint,
  });

  const pinoLogger = pino(pinoOptions, stream);

  return Object.freeze({
    trace: (...args) => pinoLogger.trace(...args),
    debug: (...args) => pinoLogger.debug(...args),
    info: (...args) => pinoLogger.info(...args),
    warn: (...args) => pinoLogger.warn(...args),
    error: (...args) => pinoLogger.error(...args),
    fatal: (...args) => pinoLogger.fatal(...args),
    child: (bindings) => {
      if (!bindings || typeof bindings !== "object") {
        throw new Error("Bindings must be a non-null object");
      }
      return pinoLogger.child(bindings);
    },
    flush: () => {
      if (typeof pinoLogger.flush === "function") {
        pinoLogger.flush();
      }
    },
    isLevelEnabled: (level) => pinoLogger.isLevelEnabled(level),
  });
}

module.exports = Object.freeze({
  createLogger: (options = {}) => {
    const config = buildLoggerConfig(options);
    return createLoggerInstance(config);
  },
});
