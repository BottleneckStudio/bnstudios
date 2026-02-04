"use strict";

function createInMemoryStore(maxSize = 10000, cleanupInterval = 60000) {
  const store = new Map();

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.expiresAt) {
        store.delete(key);
      }
    }
  }, cleanupInterval);

  if (timer.unref) {
    timer.unref();
  }

  return Object.freeze({
    has: (key) => {
      const entry = store.get(key);
      if (!entry) {
        return false;
      }
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return false;
      }
      return true;
    },
    get: (key) => {
      const entry = store.get(key);
      if (!entry) {
        return undefined;
      }
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set: (key, value, ttl) => {
      if (store.size >= maxSize) {
        const firstKey = store.keys().next().value;
        store.delete(firstKey);
      }
      store.set(key, {
        value,
        expiresAt: Date.now() + ttl,
      });
    },
    destroy: () => clearInterval(timer),
  });
}

const IN_FLIGHT = Symbol("in-flight");

function create(options = {}) {
  const {
    headerName = "idempotent-key",
    ttl = 86400000,
    store = createInMemoryStore(),
    methods = ["POST", "PUT", "PATCH"],
  } = options;

  const normalizedHeader = headerName.toLowerCase();
  const methodSet = new Set(methods.map((m) => m.toUpperCase()));

  return (req, res, next) => {
    if (!methodSet.has(req.method)) {
      return next();
    }

    const key = req.headers[normalizedHeader];
    if (!key) {
      return next();
    }

    const cached = store.get(key);

    if (cached === IN_FLIGHT) {
      return res.status(409).json({
        error: "A request with this idempotency key is already in progress",
      });
    }

    if (cached) {
      res.set("X-Idempotent-Replayed", "true");
      return res.status(cached.statusCode).json(cached.body);
    }

    store.set(key, IN_FLIGHT, ttl);

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      store.set(key, { statusCode: res.statusCode, body }, ttl);
      return originalJson(body);
    };

    next();
  };
}

module.exports = Object.freeze({
  create,
  createInMemoryStore,
});
