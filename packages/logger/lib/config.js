'use strict';

const { normalizeLevel } = require('./levels');

const DEFAULTS = Object.freeze({
  serviceName: 'app',
  level: 'info',
  logFile: Object.freeze({
    enabled: false
  })
})

function buildLoggerConfig(options = {}) {
  const merged = {
    ...DEFAULTS,
    ...options,
    logFile: {
      ...DEFAULTS.logFile,
      ...(options.logFile || {})
    }
  }

  const level = normalizeLevel(merged.level)

  if (typeof merged.serviceName !== 'string' || merged.serviceName.trim() === '') {
    throw new Error('serviceName must be a non-empty string')
  }

  if (merged.logFile.enabled && !merged.logFile.destination) {
    throw new Error('logFile.destination is required when logFile.enabled is true')
  }

  return Object.freeze({
    serviceName: merged.serviceName.trim(),
    level,
    logFile: Object.freeze({ ...merged.logFile }),
    prettyPrint: merged.prettyPrint !== undefined
      ? merged.prettyPrint
      : process.stdout.isTTY
  })
}

module.exports = Object.freeze({
  DEFAULTS,
  buildLoggerConfig
})