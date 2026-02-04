"use strict";

const { normalizeLevel, VALID_LEVELS } = require("../lib/levels");

describe("Log Level", () => {
  describe("VALID_LEVEL", () => {
    it("should contain all expected pino levels", () => {
      expect(VALID_LEVELS).toEqual(["trace", "debug", "info", "warn", "error", "fatal", "silent"]);
    });

    it("should be frozen", () => {
      expect(Object.isFrozen(VALID_LEVELS)).toBe(true);
    });
  });

  describe("normalizeLevel", () => {
    it("should normalize uppercase levels", () => {
      expect(normalizeLevel("INFO")).toBe("info");
      expect(normalizeLevel("DEBUG")).toBe("debug");
      expect(normalizeLevel("WARN")).toBe("warn");
      expect(normalizeLevel("ERROR")).toBe("error");
      expect(normalizeLevel("FATAL")).toBe("fatal");
      expect(normalizeLevel("TRACE")).toBe("trace");
    });

    it("should normalize mixed case levels", () => {
      expect(normalizeLevel("Info")).toBe("info");
      expect(normalizeLevel("DeBuG")).toBe("debug");
    });

    it("should pass through lowercase levels", () => {
      expect(normalizeLevel("info")).toBe("info");
      expect(normalizeLevel("debug")).toBe("debug");
    });

    it("should trim whitespace", () => {
      expect(normalizeLevel("  info  ")).toBe("info");
    });

    it("should throw for invalid level strings", () => {
      expect(() => normalizeLevel("verbose")).toThrow('Invalid log level "verbose"');
      expect(() => normalizeLevel("")).toThrow("Invalid log level");
    });

    it("should throw for non-string input", () => {
      expect(() => normalizeLevel(42)).toThrow("Log level must be a string");
      expect(() => normalizeLevel(null)).toThrow("Log level must be a string");
      expect(() => normalizeLevel(undefined)).toThrow("Log level must be a string");
    });
  });
});
