'use strict';

const { buildLoggerConfig, DEFAULTS } = require('../lib/config');

describe('Log Config', () => {
  describe('DEFAULTS', () => {
    it('should have expected default values', () => {
      expect(DEFAULTS.serviceName).toBe('app');
      expect(DEFAULTS.level).toBe('info');
      expect(DEFAULTS.logFile).toEqual({ enabled: false });
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(DEFAULTS)).toBe(true);
    });
  });

  describe('loggerConfig', () => {
    it('should configure a logger config', () => {
      const config = buildLoggerConfig();

      expect(config).not.toBeNull();
    });

    it('should return defaults when called with no arguments', () => {
      const config = buildLoggerConfig();

      expect(config.serviceName).toBe('app');
      expect(config.level).toBe('info');
      expect(config.logFile.enabled).toBe(false);
    });

    it('should return a frozen object', () => {
      const config = buildLoggerConfig();

      expect(Object.isFrozen(config)).toBe(true);
      expect(Object.isFrozen(config.logFile)).toBe(true);
    });

    it('should merge user options with defaults', () => {
      const config = buildLoggerConfig({
        serviceName: 'my-service',
        level: 'DEBUG'
      });

      expect(config.serviceName).toBe('my-service');
      expect(config.level).toBe('debug');
    });

    it('should normalize the log level', () => {
      const config = buildLoggerConfig({ level: 'WARN' });

      expect(config.level).toBe('warn');
    });

    it('should merge logFile options', () => {
      const config = buildLoggerConfig({
        logFile: { enabled: true, destination: '/tmp/app.log' }
      });

      expect(config.logFile.enabled).toBe(true);
      expect(config.logFile.destination).toBe('/tmp/app.log');
    });

    it('should throw for invalid serviceName', () => {
      expect(() => buildLoggerConfig({ serviceName: '' })).toThrow(
        'serviceName must be a non-empty string'
      );
      expect(() => buildLoggerConfig({ serviceName: 123 })).toThrow(
        'serviceName must be a non-empty string'
      );
    });

    it('should throw when logFile is enabled without destination', () => {
      expect(() => buildLoggerConfig({
        logFile: { enabled: true }
      })).toThrow('logFile.destination is required when logFile.enabled is true');
    });

    it('should throw for invalid log level', () => {
      expect(() => buildLoggerConfig({ level: 'verbose' })).toThrow(
        'Invalid log level'
      );
    });

    it('should trim serviceName whitespace', () => {
      const config = buildLoggerConfig({ serviceName: '  my-app  ' });

      expect(config.serviceName).toBe('my-app');
    });

    it('should respect explicit prettyPrint setting', () => {
      const config = buildLoggerConfig({ prettyPrint: false });

      expect(config.prettyPrint).toBe(false);
    });
  });
});