"use strict";

const http = require("node:http");
const { init, start, shutdown, _resetContext } = require("../../lib/server");

function httpGet(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ statusCode: res.statusCode, body: data, headers: res.headers });
        }
      });
    });
    req.on("error", reject);
  });
}

describe("server integration", () => {
  afterEach(async () => {
    try {
      await shutdown({ timeout: 2000 });
    } catch {
      // ignore
    }
    _resetContext();
  });

  it("should init, start, serve health, and shutdown", async () => {
    const config = {
      serviceName: "test-app",
      port: 0,
      loggerOptions: { prettyPrint: false },
    };

    const { app, router, logger } = await init(config);

    expect(app).toBeDefined();
    expect(router).toBeDefined();
    expect(logger).toBeDefined();

    router.get("/ping", (req, res) => {
      res.json({ pong: true });
    });

    const result = await start(config);
    const port = result.server.address().port;

    const healthRes = await httpGet(port, "/health");
    expect(healthRes.statusCode).toBe(200);
    expect(healthRes.body.status).toBe("healthy");
    expect(healthRes.body.service).toBe("test-app");

    const pingRes = await httpGet(port, "/ping");
    expect(pingRes.statusCode).toBe(200);
    expect(pingRes.body.pong).toBe(true);

    await shutdown({ timeout: 2000 });
  });

  it("should return 404 for unknown routes", async () => {
    const config = {
      serviceName: "test-404",
      port: 0,
      loggerOptions: { prettyPrint: false },
    };

    await init(config);
    const result = await start(config);
    const port = result.server.address().port;

    const res = await httpGet(port, "/unknown-path");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Not Found");
  });

  it("should throw if init is called twice", async () => {
    const config = {
      serviceName: "test-double-init",
      loggerOptions: { prettyPrint: false },
    };

    await init(config);

    await expect(init(config)).rejects.toThrow("Server already initialized.");
  });

  it("should throw if start is called before init", () => {
    expect(() => start()).toThrow("Application not initialized");
  });

  it("should apply user middlewares in order", async () => {
    const config = {
      serviceName: "test-mw",
      port: 0,
      loggerOptions: { prettyPrint: false },
      middlewares: [{ cors: true }],
    };

    const { router } = await init(config);

    router.get("/test", (req, res) => {
      res.json({ ok: true });
    });

    const result = await start(config);
    const port = result.server.address().port;

    const res = await httpGet(port, "/test");
    expect(res.statusCode).toBe(200);

    // CORS headers should be present
    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });

  it("should handle errors thrown in route handlers", async () => {
    const config = {
      serviceName: "test-error",
      port: 0,
      loggerOptions: { prettyPrint: false },
    };

    const { router } = await init(config);

    router.get("/blow-up", (req, res, next) => {
      const err = new Error("Boom");
      err.statusCode = 500;
      next(err);
    });

    const result = await start(config);
    const port = result.server.address().port;

    const res = await httpGet(port, "/blow-up");
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Boom");
  });

  it("should hide error details for non-operational errors", async () => {
    const config = {
      serviceName: "test-non-operational",
      port: 0,
      loggerOptions: { prettyPrint: false },
    };

    const { router } = await init(config);

    router.get("/internal-error", (req, res, next) => {
      next(new Error("secret database info"));
    });

    const result = await start(config);
    const port = result.server.address().port;

    const res = await httpGet(port, "/internal-error");
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");
  });
});
