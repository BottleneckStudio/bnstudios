"use strict";

const { setup404Handler, setupErrorHandler } = require("../../lib/error-handlers");

describe("error-handlers", () => {
  describe("setup404Handler", () => {
    it("should register a middleware", () => {
      const app = { use: jest.fn() };

      setup404Handler(app);

      expect(app.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should respond with 404 JSON", () => {
      const app = { use: jest.fn() };
      setup404Handler(app);

      const handler = app.use.mock.calls[0][0];
      const req = { path: "/missing" };
      const json = jest.fn();
      const res = { headersSent: false, status: jest.fn(() => ({ json })) };
      const next = jest.fn();

      handler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({
        error: "Not Found",
        path: "/missing",
      });
    });

    it("should call next when headers already sent", () => {
      const app = { use: jest.fn() };
      setup404Handler(app);

      const handler = app.use.mock.calls[0][0];
      const req = { path: "/missing" };
      const res = { headersSent: true, status: jest.fn() };
      const next = jest.fn();

      handler(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("setupErrorHandler", () => {
    it("should register a middleware", () => {
      const app = { use: jest.fn() };
      const logger = { error: jest.fn() };

      setupErrorHandler(app, logger);

      expect(app.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should hide internal error messages for 500 errors", () => {
      const app = { use: jest.fn() };
      const logger = { error: jest.fn() };
      setupErrorHandler(app, logger);

      const handler = app.use.mock.calls[0][0];
      const err = new Error("database connection failed at 10.0.0.5");
      const req = { path: "/api", method: "GET" };
      const json = jest.fn();
      const res = { headersSent: false, status: jest.fn(() => ({ json })) };
      const next = jest.fn();

      handler(err, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Internal Server Error" }),
      );
    });

    it("should expose error message for operational errors with statusCode", () => {
      const app = { use: jest.fn() };
      const logger = { error: jest.fn() };
      setupErrorHandler(app, logger);

      const handler = app.use.mock.calls[0][0];
      const err = Object.assign(new Error("Bad Request"), { statusCode: 400 });
      const req = { path: "/api", method: "POST" };
      const json = jest.fn();
      const res = { headersSent: false, status: jest.fn(() => ({ json })) };
      const next = jest.fn();

      handler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const responseBody = json.mock.calls[0][0];
      expect(responseBody.error).toBe("Bad Request");
    });

    it("should use error status if statusCode not available", () => {
      const app = { use: jest.fn() };
      const logger = { error: jest.fn() };
      setupErrorHandler(app, logger);

      const handler = app.use.mock.calls[0][0];
      const err = Object.assign(new Error("Forbidden"), { status: 403 });
      const req = { path: "/api", method: "GET" };
      const json = jest.fn();
      const res = { headersSent: false, status: jest.fn(() => ({ json })) };
      const next = jest.fn();

      handler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should include detail and stack in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const app = { use: jest.fn() };
      const logger = { error: jest.fn() };
      setupErrorHandler(app, logger);

      const handler = app.use.mock.calls[0][0];
      const err = new Error("Dev error");
      const req = { path: "/api", method: "GET" };
      const json = jest.fn();
      const res = { headersSent: false, status: jest.fn(() => ({ json })) };
      const next = jest.fn();

      handler(err, req, res, next);

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "Dev error",
          stack: expect.any(String),
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should not include stack in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const app = { use: jest.fn() };
      const logger = { error: jest.fn() };
      setupErrorHandler(app, logger);

      const handler = app.use.mock.calls[0][0];
      const err = new Error("Prod error");
      const req = { path: "/api", method: "GET" };
      const json = jest.fn();
      const res = { headersSent: false, status: jest.fn(() => ({ json })) };
      const next = jest.fn();

      handler(err, req, res, next);

      const responseBody = json.mock.calls[0][0];
      expect(responseBody.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it("should call next(err) when headers already sent", () => {
      const app = { use: jest.fn() };
      const logger = { error: jest.fn() };
      setupErrorHandler(app, logger);

      const handler = app.use.mock.calls[0][0];
      const err = new Error("Too late");
      const req = { path: "/api", method: "GET" };
      const res = { headersSent: true, status: jest.fn() };
      const next = jest.fn();

      handler(err, req, res, next);

      expect(next).toHaveBeenCalledWith(err);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
