"use strict";

function create(options = {}, context = {}) {
  const {
    excludePaths = ["/health", "/metrics"],
    headerName = "Authorization",
    validator,
  } = options;

  const { logger } = context;

  return async (req, res, next) => {
    if (res.headersSent) {
      return next();
    }

    const shouldSkip = excludePaths.some((p) => req.path === p || req.path.startsWith(p + "/"));
    if (shouldSkip) {
      return next();
    }

    const token = req.headers[headerName.toLowerCase()];

    if (!token) {
      if (logger) {
        logger.warn({ path: req.path }, "Missing authentication token");
      }
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      if (validator && typeof validator === "function") {
        const user = await validator(token);
        req.user = user;
        return next();
      }

      req.user = Object.freeze({ authenticated: true });
      next();
    } catch (error) {
      if (logger) {
        logger.error({ error: error.message, path: req.path }, "Authentication failed");
      }

      return res.status(401).json({
        error: "Invalid authentication token",
      });
    }
  };
}

module.exports = Object.freeze({ create });
