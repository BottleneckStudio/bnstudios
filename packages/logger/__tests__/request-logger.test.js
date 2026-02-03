'use strict';

const { requestLogger } = require('../lib/request-logger');

function createMockLogger() {
  const childLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  };

  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => childLogger),
    _childLogger: childLogger
  };
}

function createMockReq() {
  return {
    method: 'GET',
    path: '/api/users'
  };
}

function createMockRes() {
  const listeners = {};
  return {
    statusCode: 200,
    on: jest.fn((event, fn) => {
      listeners[event] = fn
    }),
    _emit: (event) => {
      if (listeners[event]) {
        listeners[event]()
      }
    }
  };
}

describe('Request Logging', () => {
  it('should throw when logger is missing', () => {
    expect(() => requestLogger(null)).toThrow(
      'A logger instance with a child() method is required'
    );
  });

  it('should throw when logger lacks child method', () => {
    expect(() => requestLogger({ info: jest.fn() })).toThrow(
      'A logger instance with a child() method is required'
    );
  });

  it('should return a middleware function', () => {
    const logger = createMockLogger();
    const middleware = requestLogger(logger);

    expect(typeof middleware).toBe('function');
    expect(middleware.length).toBe(3);
  });

  it('should attach child logger to request', () => {
    const logger = createMockLogger();
    const middleware = requestLogger(logger);
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(logger.child).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: expect.any(String) })
    );
    expect(req.logger).toBe(logger._childLogger);
  });

  it('should attach requestId to request', () => {
    const logger = createMockLogger();
    const middleware = requestLogger(logger);
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(typeof req.requestId).toBe('string');
    expect(req.requestId.length).toBeGreaterThan(0);
  });

  it('should call next()', () => {
    const logger = createMockLogger();
    const middleware = requestLogger(logger);
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should log on response finish', () => {
    const logger = createMockLogger();
    const middleware = requestLogger(logger);
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);
    res._emit('finish');

    expect(logger._childLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        duration: expect.any(Number)
      }),
      'request completed'
    );
  });

  it('should generate unique requestIds per request', () => {
    const logger = createMockLogger();
    const middleware = requestLogger(logger);
    const req1 = createMockReq();
    const req2 = createMockReq();
    const res1 = createMockRes();
    const res2 = createMockRes();
    const next = jest.fn();

    middleware(req1, res1, next);
    middleware(req2, res2, next);

    expect(req1.requestId).not.toBe(req2.requestId);
  });
});
