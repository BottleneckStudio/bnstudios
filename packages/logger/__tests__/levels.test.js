'use strict';

const { VALID_LEVELS } = require('../lib/levels');

describe('Log Level', () => {
  describe('VALID_LEVEL', () => {
    it('should contain all expected pino levels', () => {
      expect(VALID_LEVELS).toEqual([
        'trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'
      ]);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(VALID_LEVELS)).toBe(true);
    });
  });
});