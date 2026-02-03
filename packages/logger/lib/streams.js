'use strict';

const fs = require('node:fs');
const path = require('node:path');
const pino = require('pino');

module.exports = Object.freeze({
  createStream: (options = {}) => {
    const { logFile, prettyPrint } = options;

    if (logFile && logFile.enabled && logFile.destination) {
      const dir = path.dirname(logFile.destination);

      // check if dir exists, create if not
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      return pino.destination({
        dest: logFile.destination,
        sync: false,
      });
    }

    // by default, write to stdout
    return pino.destination(1);
  }
});