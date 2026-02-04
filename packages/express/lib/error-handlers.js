"use strict";

module.exports = Object.freeze({
  setup404Handler: (app) => {
    return app.use((req, res, next) => {
      if (res.headersSent) {
        return next();
      }

      res.status(404).json({
        error: "Not Found",
        path: req.path,
      });
    });
  },
  setupErrorHandler: (app, logger) => {
    return app.use((err, req, res, next) => {
      if (res.headersSent) {
        return next(err);
      }

      logger.error(
        {
          err: err.message,
          stack: err.stack,
          path: req.path,
          method: req.method,
        },
        "Request error",
      );

      const statusCode = err.statusCode || err.status || 500;
      const isOperationalError = Boolean(err.statusCode || err.status);
      const clientMessage = isOperationalError ? err.message : "Internal Server Error";

      return res.status(statusCode).json({
        error: clientMessage,
        ...(process.env.NODE_ENV === "development" && {
          detail: err.message,
          stack: err.stack,
        }),
      });
    });
  },
});
