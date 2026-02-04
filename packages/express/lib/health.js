"use strict";

module.exports = Object.freeze({
  setupHealthCheck: (app, serviceName) => {
    app.get("/health", (req, res) => {
      if (res.headersSent) {
        return;
      }

      return res.status(200).json({
        status: "healthy",
        service: serviceName,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  },
});
