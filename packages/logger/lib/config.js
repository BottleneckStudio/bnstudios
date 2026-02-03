'use strict';

const { normalizeLevels } = require('./levels');

const DEFAULTS = Object.freeze({
  serviceName: 'app',
  level: 'info',
  logFile: Object.freeze({
    enabled: false
  })
})

module.exports = Object.freeze({
  DEFAULTS
})