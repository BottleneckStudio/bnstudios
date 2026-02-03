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
    const logger = createLogger({
      serviceName: 'test-service',
      level: 'DEBUG'
    });

    expect(logger).toBeDefined();
    expect(logger.isLevelEnabled('debug')).toBe(true);
  });

  it('should create a child logger with bindings', () => {
    const logger = createLogger({ prettyPrint: false });
    const child = logger.child({ requestId: 'req-123' });

    expect(child).toBeDefined();
    expect(typeof child.info).toBe('function');
  });

  it('should throw when creating child logger with invalid bindings', () => {
    const logger = createLogger({ prettyPrint: false });

    expect(() => logger.child(null)).toThrow('Bindings must be a non-null object');
    expect(() => logger.child('invalid')).toThrow('Bindings must be a non-null object');
  });

  it('should call flush without errors', () => {
    const logger = createLogger({ prettyPrint: false });

    expect(() => logger.flush()).not.toThrow();
  });

  it('should report level enabled status correctly', () => {
    const logger = createLogger({ level: 'warn', prettyPrint: false });

    expect(logger.isLevelEnabled('error')).toBe(true);
    expect(logger.isLevelEnabled('warn')).toBe(true);
    expect(logger.isLevelEnabled('info')).toBe(false);
    expect(logger.isLevelEnabled('debug')).toBe(false);
  });

  it('should not throw when calling logging methods', () => {
    const logger = createLogger({ prettyPrint: false });

    expect(() => logger.trace('trace msg')).not.toThrow();
    expect(() => logger.debug('debug msg')).not.toThrow();
    expect(() => logger.info('info msg')).not.toThrow();
    expect(() => logger.warn('warn msg')).not.toThrow();
    expect(() => logger.error('error msg')).not.toThrow();
    expect(() => logger.fatal('fatal msg')).not.toThrow();
  });
});