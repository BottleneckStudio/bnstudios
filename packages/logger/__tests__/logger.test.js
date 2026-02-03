'use strict';

const { createLogger } = require('../lib/logger');

describe('Logger Creation', () => {
  it('should create a logger with default options', () => {
    const logger = createLogger();

    expect(typeof logger.trace).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.fatal).toBe('function');
    expect(typeof logger.child).toBe('function');
    expect(typeof logger.flush).toBe('function');
    expect(typeof logger.isLevelEnabled).toBe('function');
  });

  it('should return a frozen object', () => {
    const logger = createLogger();

    expect(Object.isFrozen(logger)).toBe(true);
  });

  it('should create a logger with custom options', () => {
  });

  it('should create a child logger with bindings', () => {
  });

  it('should throw when creating child logger with invalid bindings', () => {
  });

  it('should call flush without errors', () => {
  });

  it('should report level enabled status correctly', () => {
  });

  it('should not throw when calling logging methods', () => {
  });
});