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
});