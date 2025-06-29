// Экспортируем все типы
export * from './src/types.js';

// Экспортируем утилиты
export * from './src/utils.js';

// Экспортируем транспорты
export * from './src/transports.js';

// Экспортируем основной класс логгера
export { Logger } from './src/logger.js';

// Создаем глобальный экземпляр логгера
import { Logger } from './src/logger.js';
import { LoggerConfig } from './src/types.js';

/**
 * Глобальный экземпляр логгера для быстрого доступа
 */
export const logger = Logger.getInstance();

/**
 * Создать новый экземпляр логгера с кастомной конфигурацией
 */
export function createLogger(config?: Partial<LoggerConfig>) {
  return new Logger(config);
}

/**
 * Получить глобальный экземпляр логгера
 */
export function getLogger() {
  return Logger.getInstance();
}

/**
 * Сбросить глобальный экземпляр логгера (для тестирования)
 */
export function resetLogger() {
  Logger.resetInstance();
}

// Экспортируем удобные функции для быстрого логирования
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  trace: (message: string, meta?: any) => logger.trace(message, meta),
};

// Экспортируем по умолчанию
export default logger; 
