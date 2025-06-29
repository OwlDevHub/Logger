import { 
  LogLevel, 
  Environment, 
  LoggerConfig, 
  Transport, 
  LogContext 
} from './types.js';
import { 
  detectExecutionContext, 
  detectEnvironment, 
  getProcessInfo 
} from './utils.js';
import { createConsoleTransport } from './transports.js';

/**
 * Основной класс логгера
 */
export class Logger {
  private config: LoggerConfig;
  private static instance: Logger | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    // Автоматически определяем контекст и окружение
    const context = config.context ?? detectExecutionContext();
    const environment = config.environment ?? detectEnvironment();
    
    // Настройки по умолчанию в зависимости от окружения
    const defaultLevel = environment === Environment.PRODUCTION 
      ? LogLevel.WARN 
      : LogLevel.DEBUG;
    
    const defaultConfig: LoggerConfig = {
      level: defaultLevel,
      transports: [],
      context,
      environment,
      enableConsoleColors: environment === Environment.DEVELOPMENT,
      enableTimestamp: true,
      enableProcessInfo: true,
      maxLogFileSize: 10 * 1024 * 1024, // 10MB
      maxLogFiles: 5,
    };

    this.config = { ...defaultConfig, ...config };
    
    // Добавляем консольный транспорт по умолчанию
    if (this.config.transports.length === 0) {
      this.config.transports.push(
        createConsoleTransport(this.config.enableConsoleColors)
      );
    }
  }

  /**
   * Получить синглтон экземпляр логгера
   */
  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Сбросить синглтон экземпляр (для тестирования)
   */
  static resetInstance(): void {
    Logger.instance = null;
  }

  /**
   * Проверяет, должен ли лог быть записан
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  /**
   * Создает контекст лога
   */
  private createLogContext(level: LogLevel, message: string, meta?: any): LogContext {
    const processInfo = this.config.enableProcessInfo ? getProcessInfo() : {};
    
    return {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      message,
      meta,
      context: this.config.context,
      environment: this.config.environment,
      ...processInfo,
    };
  }

  /**
   * Основной метод логирования
   */
  private async log(level: LogLevel, message: string, meta?: any): Promise<void> {
    if (!this.shouldLog(level)) return;

    const context = this.createLogContext(level, message, meta);

    // Выполняем все транспорты
    const transportPromises = this.config.transports.map(async (transport) => {
      try {
        const result = transport(level, message, meta, context);
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        console.error('Logging transport error:', error);
      }
    });

    await Promise.all(transportPromises);
  }

  /**
   * Логирование ошибок
   */
  error(message: string, meta?: any): Promise<void> {
    return this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * Логирование предупреждений
   */
  warn(message: string, meta?: any): Promise<void> {
    return this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Логирование информации
   */
  info(message: string, meta?: any): Promise<void> {
    return this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Логирование отладочной информации
   */
  debug(message: string, meta?: any): Promise<void> {
    return this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Логирование трассировки
   */
  trace(message: string, meta?: any): Promise<void> {
    return this.log(LogLevel.TRACE, message, meta);
  }

  /**
   * Добавить новый транспорт
   */
  addTransport(transport: Transport): void {
    this.config.transports.push(transport);
  }

  /**
   * Удалить транспорт по индексу
   */
  removeTransport(index: number): void {
    if (index >= 0 && index < this.config.transports.length) {
      this.config.transports.splice(index, 1);
    }
  }

  /**
   * Очистить все транспорты
   */
  clearTransports(): void {
    this.config.transports = [];
  }

  /**
   * Установить уровень логирования
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Получить текущий уровень логирования
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Получить конфигурацию логгера
   */
  getConfig(): Readonly<LoggerConfig> {
    return { ...this.config };
  }

  /**
   * Проверить, включен ли определенный уровень
   */
  isLevelEnabled(level: LogLevel): boolean {
    return this.shouldLog(level);
  }

  /**
   * Создать дочерний логгер с дополнительными метаданными
   */
  child(meta: any): Logger {
    const childLogger = new Logger(this.config);
    
    // Перехватываем все вызовы и добавляем метаданные
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = async (level: LogLevel, message: string, childMeta?: any) => {
      const combinedMeta = { ...meta, ...childMeta };
      return originalLog(level, message, combinedMeta);
    };

    return childLogger;
  }
} 
