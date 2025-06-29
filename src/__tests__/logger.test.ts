import { Logger, LogLevel, Environment, createLogger, getLogger } from '../index.js';

describe('Logger', () => {
  beforeEach(() => {
    // Reset logger before each test
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should create logger instance', () => {
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should log messages at correct levels', async () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      
      await logger.error('Error message');
      await logger.warn('Warning message');
      await logger.info('Info message');
      await logger.debug('Debug message');
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'), expect.anything()
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'), expect.anything()
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'), expect.anything()
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'), expect.anything()
      );
    });

    it('should respect log level', async () => {
      const logger = new Logger({ level: LogLevel.WARN });
      
      await logger.error('Error message');
      await logger.warn('Warning message');
      await logger.info('Info message'); // Should not be logged
      await logger.debug('Debug message'); // Should not be logged
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.info).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('Singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance', () => {
      const instance1 = Logger.getInstance();
      Logger.resetInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should detect environment correctly', () => {
      if (typeof process === 'undefined') {
        // Skip test if process is not available
        return;
      }
      
      const originalEnv = process.env.NODE_ENV;
      
      // Test for development
      process.env.NODE_ENV = 'development';
      const devLogger = new Logger();
      expect(devLogger.getConfig().environment).toBe(Environment.DEVELOPMENT);
      
      // Test for production
      process.env.NODE_ENV = 'production';
      const prodLogger = new Logger();
      expect(prodLogger.getConfig().environment).toBe(Environment.PRODUCTION);
      
      // Restore original value
      process.env.NODE_ENV = originalEnv;
    });

    it('should set custom configuration', () => {
      const customConfig = {
        level: LogLevel.ERROR,
        enableConsoleColors: false,
        enableTimestamp: false,
      };
      
      const logger = new Logger(customConfig);
      const config = logger.getConfig();
      
      expect(config.level).toBe(LogLevel.ERROR);
      expect(config.enableConsoleColors).toBe(false);
      expect(config.enableTimestamp).toBe(false);
    });
  });

  describe('Child logger', () => {
    it('should create child logger with metadata', async () => {
      const parentLogger = new Logger();
      const childLogger = parentLogger.child({ userId: '123', session: 'abc' });
      
      await childLogger.info('User action', { action: 'login' });
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.objectContaining({
          userId: '123',
          session: 'abc',
          action: 'login'
        })
      );
    });
  });

  describe('Utility functions', () => {
    it('should create logger with createLogger function', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      expect(logger).toBeInstanceOf(Logger);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });

    it('should get global logger instance', () => {
      const globalLogger = getLogger();
      expect(globalLogger).toBeInstanceOf(Logger);
    });
  });
}); 
