"use strict";

const { getMiddlewareFactory, getRegisteredNames } = require("../../../lib/middleware/registry");

describe("middleware/registry", () => {
  it("should return factory for known middleware", () => {
    const factory = getMiddlewareFactory("cors");

    expect(factory).toBeDefined();
    expect(typeof factory.create).toBe("function");
  });

  it("should return null for unknown middleware", () => {
    const factory = getMiddlewareFactory("nonexistent");

    expect(factory).toBeNull();
  });

  it("should return all registered names", () => {
    const names = getRegisteredNames();

    expect(names).toContain("cors");
    expect(names).toContain("helmet");
    expect(names).toContain("authentication");
    expect(names).toContain("rateLimiter");
    expect(names).toContain("idempotency");
    expect(names).toContain("requestLogging");
    expect(names).toContain("compression");
  });

  it("should return factories for all registered names", () => {
    const names = getRegisteredNames();

    for (const name of names) {
      const factory = getMiddlewareFactory(name);
      expect(factory).toBeDefined();
      expect(typeof factory.create).toBe("function");
    }
  });
});
