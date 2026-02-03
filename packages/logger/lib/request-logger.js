'use strict';

const crypto = require('node:crypto');

module.exports = Object.freeze({
  requestLogger: (logger) => {
    if (!logger || typeof logger.child !== 'function') {
      throw new Error('A logger instance with a child() method is required')
    }

    return (req, res, next) => {
      const requestId = crypto.randomUUID();
      const start = Date.now();

      const childLogger = logger.child({ requestId });
      req.logger = childLogger;
      req.requestId = requestId;

      res.on('finish', () => {
        const duration = Date.now() - start;
        childLogger.info({
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration
        }, 'request completed');
      });

      return next();
    }
  }
});