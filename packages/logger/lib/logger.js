'use strict';

const pino = require('pino');
const { buildLoggerConfig } = require('./config');

function createLoggerInstance(config) {
  const pinoOptions = {
    level: config.level,
    timestamp: pino.stdTimeFunctions.isoTime,
    base: { service: config.serviceName }
  };
}

module.exports = Object.freeze({
  createLogger: (options = {}) => {
    const config = buildLoggerConfig(options);
    return createLoggerInstance(config);
  }
});