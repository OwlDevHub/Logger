// Экспортируем все типы
export * from './types.js';
// Экспортируем утилиты
export * from './utils.js';
// Экспортируем транспорты
export * from './transports.js';
// Экспортируем основной класс логгера
export { Logger } from './logger.js';
// Создаем глобальный экземпляр логгера
import { Logger } from './logger.js';
/**
 * Глобальный экземпляр логгера для быстрого доступа
 */
export const logger = Logger.getInstance();
/**
 * Создать новый экземпляр логгера с кастомной конфигурацией
 */
export function createLogger(config) {
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
    error: (message, meta) => logger.error(message, meta),
    warn: (message, meta) => logger.warn(message, meta),
    info: (message, meta) => logger.info(message, meta),
    debug: (message, meta) => logger.debug(message, meta),
    trace: (message, meta) => logger.trace(message, meta),
};
// Экспортируем по умолчанию
export default logger;
//# sourceMappingURL=index.js.map