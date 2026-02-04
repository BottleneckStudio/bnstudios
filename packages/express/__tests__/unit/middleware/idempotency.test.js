"use strict";

const { create, createInMemoryStore } = require("../../../lib/middleware/idempotency");

describe("middleware/idempotency", () => {
  describe("createInMemoryStore", () => {
    it("should store and retrieve values", () => {
      const store = createInMemoryStore();

      store.set("key1", "value1", 60000);

      expect(store.has("key1")).toBe(true);
      expect(store.get("key1")).toBe("value1");
    });

    it("should return false for missing keys", () => {
      const store = createInMemoryStore();

      expect(store.has("missing")).toBe(false);
      expect(store.get("missing")).toBeUndefined();
    });

    it("should expire entries after ttl", () => {
      const store = createInMemoryStore();
      jest.useFakeTimers();

      store.set("key1", "value1", 100);

      expect(store.has("key1")).toBe(true);

      jest.advanceTimersByTime(101);

      expect(store.has("key1")).toBe(false);
      expect(store.get("key1")).toBeUndefined();

      jest.useRealTimers();
    });
  });

  describe("middleware", () => {
    function createMockReq(method, headers = {}) {
      return { method, headers };
    }

    function createMockRes() {
      const json = jest.fn();
      const set = jest.fn();
      return {
        statusCode: 200,
        status: jest.fn(function (code) {
          this.statusCode = code;
          return this;
        }),
        json,
        set,
      };
    }

    it("should pass through GET requests", () => {
      const middleware = create();
      const req = createMockReq("GET", { "idempotent-key": "abc" });
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should pass through DELETE requests by default", () => {
      const middleware = create();
      const req = createMockReq("DELETE", { "idempotent-key": "abc" });
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should pass through POST without idempotency key", () => {
      const middleware = create();
      const req = createMockReq("POST");
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should process POST requests with idempotency key", () => {
      const middleware = create();
      const req = createMockReq("POST", { "idempotent-key": "key-1" });
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(typeof res.json).toBe("function");
    });

    it("should cache and replay responses", () => {
      const middleware = create();

      // First request
      const req1 = createMockReq("POST", { "idempotent-key": "key-2" });
      const res1 = createMockRes();
      const next1 = jest.fn();

      middleware(req1, res1, next1);
      res1.statusCode = 201;
      res1.json({ id: 1, status: "created" });

      // Second request with same key
      const req2 = createMockReq("POST", { "idempotent-key": "key-2" });
      const res2 = createMockRes();
      const next2 = jest.fn();

      middleware(req2, res2, next2);

      expect(next2).not.toHaveBeenCalled();
      expect(res2.set).toHaveBeenCalledWith("X-Idempotent-Replayed", "true");
      expect(res2.status).toHaveBeenCalledWith(201);
      expect(res2.json).toHaveBeenCalledWith({ id: 1, status: "created" });
    });

    it("should return 409 for in-flight duplicate", () => {
      const middleware = create();

      // First request starts but doesn't complete
      const req1 = createMockReq("POST", { "idempotent-key": "key-3" });
      const res1 = createMockRes();
      const next1 = jest.fn();
      middleware(req1, res1, next1);

      // Second request with same key while first is in-flight
      const req2 = createMockReq("POST", { "idempotent-key": "key-3" });
      const res2 = createMockRes();
      const next2 = jest.fn();
      middleware(req2, res2, next2);

      expect(next2).not.toHaveBeenCalled();
      expect(res2.status).toHaveBeenCalledWith(409);
    });

    it("should support custom header name", () => {
      const middleware = create({ headerName: "X-Request-Id" });
      const req = createMockReq("POST", { "x-request-id": "custom-key" });
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should support custom methods", () => {
      const middleware = create({ methods: ["PUT"] });

      const postReq = createMockReq("POST", { "idempotent-key": "k1" });
      const postRes = createMockRes();
      const postNext = jest.fn();
      middleware(postReq, postRes, postNext);
      expect(postNext).toHaveBeenCalled();

      const putReq = createMockReq("PUT", { "idempotent-key": "k2" });
      const putRes = createMockRes();
      const putNext = jest.fn();
      middleware(putReq, putRes, putNext);
      expect(putNext).toHaveBeenCalled();
    });

    it("should support PATCH method by default", () => {
      const middleware = create();
      const req = createMockReq("PATCH", { "idempotent-key": "patch-key" });
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
