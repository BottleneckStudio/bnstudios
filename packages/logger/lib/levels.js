"use strict";

const VALID_LEVELS = Object.freeze(["trace", "debug", "info", "warn", "error", "fatal", "silent"]);

module.exports = Object.freeze({
  VALID_LEVELS,
  normalizeLevel: (level) => {
    if (typeof level !== "string") {
      throw new Error(`Log level must be a string, received ${typeof level}`);
    }

    const normalized = level.toLowerCase().trim();

    if (!VALID_LEVELS.includes(normalized)) {
      throw new Error(`Invalid log level "${level}". Valid levels: ${VALID_LEVELS.join(", ")}`);
    }

    return normalized;
  },
});
