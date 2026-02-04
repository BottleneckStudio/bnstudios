"use strict";

const compression = require("compression");

function create(options = {}) {
  return compression(options);
}

module.exports = Object.freeze({ create });
