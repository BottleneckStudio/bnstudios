'use strict';

const crypto = require('node:crypto');

module.exports = Object.freeze({
  requestLogger: (logger) => {
    if (!logger || typeof logger.child !== 'function') {
      throw new Error('A logger instance with a child() method is required')
    }
  }
});