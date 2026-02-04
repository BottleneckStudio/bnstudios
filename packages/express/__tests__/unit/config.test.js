"use strict";

const { validateConfig, buildServerConfig, DEFAULTS } = require("../../lib/config");

describe("config", () => {
  describe("DEFAULTS", () => {
    it("should have expected default values", () => {
      expect(DEFAULTS.port).toBe(3000);
      expect(DEFAULTS.baseUrlPath).toBe("/");
      expect(DEFAULTS.middlewares).toEqual([]);
      expect(DEFAULTS.loggerOptions).toEqual({});
    });

    it("should be frozen", () => {
      expect(Object.isFrozen(DEFAULTS)).toBe(true);
    });
  });

  describe("validateConfig", () => {
    it("should pass with valid config", () => {
      expect(() => validateConfig({ serviceName: "test" })).not.toThrow();
    });

    it("should throw for null config", () => {
      expect(() => validateConfig(null)).toThrow("Configuration must be an object");
    });

    it("should throw for non-object config", () => {
      expect(() => validateConfig("string")).toThrow("Configuration must be an object");
    });

    it("should throw for missing serviceName", () => {
      expect(() => validateConfig({})).toThrow("serviceName is required");
    });

    it("should throw for non-string serviceName", () => {
      expect(() => validateConfig({ serviceName: 123 })).toThrow("serviceName is required");
    });

    it("should throw for invalid port", () => {
      expect(() => validateConfig({ serviceName: "test", port: -1 })).toThrow(
        "port must be a number",
      );
      expect(() => validateConfig({ serviceName: "test", port: 70000 })).toThrow(
        "port must be a number",
      );
      expect(() => validateConfig({ serviceName: "test", port: "abc" })).toThrow(
        "port must be a number",
      );
    });

    it("should accept port 0 for dynamic assignment", () => {
      expect(() => validateConfig({ serviceName: "test", port: 0 })).not.toThrow();
    });

    it("should throw for non-string baseUrlPath", () => {
      expect(() => validateConfig({ serviceName: "test", baseUrlPath: 123 })).toThrow(
        "baseUrlPath must be a string",
      );
    });

    it("should throw for non-array middlewares", () => {
      expect(() => validateConfig({ serviceName: "test", middlewares: "bad" })).toThrow(
        "middlewares must be an array",
      );
    });

    it("should throw for non-object loggerOptions", () => {
      expect(() => validateConfig({ serviceName: "test", loggerOptions: "bad" })).toThrow(
        "loggerOptions must be an object",
      );
    });

    it("should include INVALID_CONFIG error code", () => {
      try {
        validateConfig(null);
      } catch (err) {
        expect(err.code).toBe("INVALID_CONFIG");
      }
    });
  });

  describe("buildServerConfig", () => {
    it("should merge user config with defaults", () => {
      const config = buildServerConfig({ serviceName: "my-app" });

      expect(config.serviceName).toBe("my-app");
      expect(config.port).toBe(3000);
      expect(config.baseUrlPath).toBe("/");
      expect(config.middlewares).toEqual([]);
    });

    it("should return frozen config", () => {
      const config = buildServerConfig({ serviceName: "test" });

      expect(Object.isFrozen(config)).toBe(true);
      expect(Object.isFrozen(config.middlewares)).toBe(true);
      expect(Object.isFrozen(config.loggerOptions)).toBe(true);
    });

    it("should inject serviceName into loggerOptions", () => {
      const config = buildServerConfig({ serviceName: "my-app" });

      expect(config.loggerOptions.serviceName).toBe("my-app");
    });

    it("should override defaults with user values", () => {
      const config = buildServerConfig({
        serviceName: "test",
        port: 8080,
        baseUrlPath: "/api",
      });

      expect(config.port).toBe(8080);
      expect(config.baseUrlPath).toBe("/api");
    });

    it("should merge loggerOptions", () => {
      const config = buildServerConfig({
        serviceName: "test",
        loggerOptions: { level: "debug" },
      });

      expect(config.loggerOptions.level).toBe("debug");
      expect(config.loggerOptions.serviceName).toBe("test");
    });

    it("should throw for invalid config", () => {
      expect(() => buildServerConfig({})).toThrow();
    });
  });
});
