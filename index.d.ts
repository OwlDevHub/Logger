export * from './src/types.js';
export * from './src/utils.js';
export * from './src/transports.js';
export { Logger } from './src/logger.js';
import { Logger } from './src/logger.js';
import { LoggerConfig } from './src/types.js';
/**
 * Глобальный экземпляр логгера для быстрого доступа
 */
export declare const logger: Logger;
/**
 * Создать новый экземпляр логгера с кастомной конфигурацией
 */
export declare function createLogger(config?: Partial<LoggerConfig>): Logger;
/**
 * Получить глобальный экземпляр логгера
 */
export declare function getLogger(): Logger;
/**
 * Сбросить глобальный экземпляр логгера (для тестирования)
 */
export declare function resetLogger(): void;
export declare const log: {
    error: (message: string, meta?: any) => Promise<void>;
    warn: (message: string, meta?: any) => Promise<void>;
    info: (message: string, meta?: any) => Promise<void>;
    debug: (message: string, meta?: any) => Promise<void>;
    trace: (message: string, meta?: any) => Promise<void>;
};
export default logger;
//# sourceMappingURL=index.d.ts.map