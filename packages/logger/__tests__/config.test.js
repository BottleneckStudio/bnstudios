'use strict';

describe('Log Config', () => {
  describe('DEFAULTS', () => {
    it('should have expected default values', () => {
      expect(DEFAULTS.serviceName).toBe('app')
      expect(DEFAULTS.level).toBe('info')
      expect(DEFAULTS.logFile).toEqual({ enabled: false })
    })

    it('should be frozen', () => {
      expect(Object.isFrozen(DEFAULTS)).toBe(true)
    })
  });
});