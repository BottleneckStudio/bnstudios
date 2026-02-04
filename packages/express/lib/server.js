"use strict";

const http = require("node:http");
const express = require("express");
const { createLogger } = require("@bnstudios/logger");
const { buildServerConfig } = require("./config");
const { createApp } = require("./app-factory");
const { setupHealthCheck } = require("./health");
const { setup404Handler, setupErrorHandler } = require("./error-handlers");
const { resolveMiddlewares } = require("./middleware");

let context = Object.freeze({
  app: null,
  server: null,
  router: null,
  logger: null,
  config: null,
  isInitialized: false,
  isRunning: false,
});

function replaceContext(updates) {
  context = Object.freeze({ ...context, ...updates });
}

function resetContext() {
  context = Object.freeze({
    app: null,
    server: null,
    router: null,
    logger: null,
    config: null,
    isInitialized: false,
    isRunning: false,
  });
}

async function init(userConfig) {
  if (context.isInitialized) {
    throw new Error("Server already initialized.");
  }

  const config = buildServerConfig(userConfig);
  const logger = createLogger(config.loggerOptions);
  const app = createApp(express);
  const router = express.Router();

  replaceContext({ config, logger, app, router });

  try {
    resolveMiddlewares(app, config.middlewares, { logger });

    app.use(config.baseUrlPath, router);

    setupHealthCheck(app, config.serviceName);
    setup404Handler(app);
    setupErrorHandler(app, logger);

    replaceContext({ isInitialized: true });

    return Object.freeze({
      app: context.app,
      router: context.router,
      express,
      logger: context.logger,
    });
  } catch (error) {
    logger.error({ err: error.message }, "Failed to initialize application");
    resetContext();
    throw error;
  }
}

function start(config) {
  if (!context.isInitialized) {
    throw new Error("Application not initialized. Call init() first.");
  }

  if (context.isRunning) {
    throw new Error("Server is already running");
  }

  const { port, serviceName } = config || context.config;

  return new Promise((resolve, reject) => {
    const server = http.createServer(context.app);
    replaceContext({ server });

    const onError = (err) => {
      if (err.code === "EADDRINUSE") {
        context.logger.error({ port }, "Port is already in use");
      } else {
        context.logger.error({ err: err.message }, "Failed to start server");
      }
      replaceContext({ isRunning: false });
      reject(err);
    };

    server.once("error", onError);

    server.listen(port, () => {
      server.removeListener("error", onError);

      server.on("error", (err) => {
        context.logger.error({ err: err.message }, "Server error");
      });

      replaceContext({ isRunning: true });
      context.logger.info({ port, serviceName }, "Server started successfully");

      resolve(
        Object.freeze({
          server: context.server,
          app: context.app,
          port,
          serviceName,
        }),
      );
    });
  });
}

async function shutdown(options = {}) {
  const { timeout = 10000 } = options;

  if (!context.server || !context.isRunning) {
    if (context.logger) {
      context.logger.debug("Server not running, nothing to shutdown");
    }
    return;
  }

  context.logger.info("Shutting down server gracefully");

  return new Promise((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      context.logger.warn("Shutdown timeout reached, forcing close");

      if (context.server.closeAllConnections) {
        context.server.closeAllConnections();
      }

      reject(Object.assign(new Error("Shutdown timeout exceeded"), { code: "SHUTDOWN_TIMEOUT" }));
    }, timeout);

    context.server.close((err) => {
      clearTimeout(timeoutHandle);
      replaceContext({ isRunning: false });

      if (err) {
        context.logger.error({ err: err.message }, "Error during shutdown");
        return reject(err);
      }

      context.logger.info("Server shut down successfully");
      resolve();
    });
  });
}

module.exports = Object.freeze({
  init,
  start,
  shutdown,
  _resetContext: resetContext,
});
