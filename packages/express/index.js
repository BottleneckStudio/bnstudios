'use strict'

const { init, start, shutdown } = require('./lib/server')

module.exports = Object.freeze({
  init,
  start,
  shutdown
})
