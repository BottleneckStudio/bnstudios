"use strict";

const helmet = require("helmet");

function create(options = {}) {
  return helmet(options);
}

module.exports = Object.freeze({ create });
