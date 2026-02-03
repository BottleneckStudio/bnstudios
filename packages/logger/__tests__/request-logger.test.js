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
  });

  it('should return a middleware function', () => {
  });

  it('should attach child logger to request', () => {
  });

  it('should attach requestId to request', () => {
  });

  it('should call next()', () => {
  });

  it('should log on response finish', () => {
  });

  it('should generate unique requestIds per request', () => {
  });
});
