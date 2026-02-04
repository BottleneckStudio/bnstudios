"use strict";

const { getMiddlewareFactory } = require("./registry");

function resolveMiddlewares(app, middlewareConfigs, context) {
  if (!Array.isArray(middlewareConfigs) || middlewareConfigs.length === 0) {
    return;
  }

  for (const item of middlewareConfigs) {
    const name = Object.keys(item).find((k) => k !== "options");
    if (!name) {
      continue;
    }

    const enabled = item[name];
    if (!enabled) {
      continue;
    }

    const factory = getMiddlewareFactory(name);
    if (!factory) {
      if (context.logger) {
        context.logger.warn({ name }, "Unknown middleware type");
      }
      continue;
    }

    const options = item.options || {};
    const middleware = factory.create(options, context);
    app.use(middleware);
  }
}

module.exports = Object.freeze({
  resolveMiddlewares,
});
