"use strict";

jest.mock("compression", () => jest.fn(() => "compression-middleware"));

const compressionFactory = require("../../../lib/middleware/compression");
const compression = require("compression");

describe("middleware/compression", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create compression middleware with defaults", () => {
    const result = compressionFactory.create();

    expect(compression).toHaveBeenCalledWith({});
    expect(result).toBe("compression-middleware");
  });

  it("should pass custom options", () => {
    compressionFactory.create({ level: 6 });

    expect(compression).toHaveBeenCalledWith({ level: 6 });
  });
});
