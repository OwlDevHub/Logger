import { LogLevel, Environment } from './types.js';
import { detectExecutionContext, detectEnvironment, getProcessInfo } from './utils.js';
import { createConsoleTransport } from './transports.js';
/**
 * Основной класс логгера
 */
export class Logger {
    constructor(config = {}) {
        // Автоматически определяем контекст и окружение
        const context = config.context ?? detectExecutionContext();
        const environment = config.environment ?? detectEnvironment();
        // Настройки по умолчанию в зависимости от окружения
        const defaultLevel = environment === Environment.PRODUCTION
            ? LogLevel.WARN
            : LogLevel.DEBUG;
        const defaultConfig = {
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
            this.config.transports.push(createConsoleTransport(this.config.enableConsoleColors));
        }
    }
    /**
     * Получить синглтон экземпляр логгера
     */
    static getInstance(config) {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }
    /**
     * Сбросить синглтон экземпляр (для тестирования)
     */
    static resetInstance() {
        Logger.instance = null;
    }
    /**
     * Проверяет, должен ли лог быть записан
     */
    shouldLog(level) {
        return level <= this.config.level;
    }
    /**
     * Создает контекст лога
     */
    createLogContext(level, message, meta) {
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
    async log(level, message, meta) {
        if (!this.shouldLog(level))
            return;
        const context = this.createLogContext(level, message, meta);
        // Выполняем все транспорты
        const transportPromises = this.config.transports.map(async (transport) => {
            try {
                const result = transport(level, message, meta, context);
                if (result instanceof Promise) {
                    await result;
                }
            }
            catch (error) {
                console.error('Logging transport error:', error);
            }
        });
        await Promise.all(transportPromises);
    }
    /**
     * Логирование ошибок
     */
    error(message, meta) {
        return this.log(LogLevel.ERROR, message, meta);
    }
    /**
     * Логирование предупреждений
     */
    warn(message, meta) {
        return this.log(LogLevel.WARN, message, meta);
    }
    /**
     * Логирование информации
     */
    info(message, meta) {
        return this.log(LogLevel.INFO, message, meta);
    }
    /**
     * Логирование отладочной информации
     */
    debug(message, meta) {
        return this.log(LogLevel.DEBUG, message, meta);
    }
    /**
     * Логирование трассировки
     */
    trace(message, meta) {
        return this.log(LogLevel.TRACE, message, meta);
    }
    /**
     * Добавить новый транспорт
     */
    addTransport(transport) {
        this.config.transports.push(transport);
    }
    /**
     * Удалить транспорт по индексу
     */
    removeTransport(index) {
        if (index >= 0 && index < this.config.transports.length) {
            this.config.transports.splice(index, 1);
        }
    }
    /**
     * Очистить все транспорты
     */
    clearTransports() {
        this.config.transports = [];
    }
    /**
     * Установить уровень логирования
     */
    setLevel(level) {
        this.config.level = level;
    }
    /**
     * Получить текущий уровень логирования
     */
    getLevel() {
        return this.config.level;
    }
    /**
     * Получить конфигурацию логгера
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Проверить, включен ли определенный уровень
     */
    isLevelEnabled(level) {
        return this.shouldLog(level);
    }
    /**
     * Создать дочерний логгер с дополнительными метаданными
     */
    child(meta) {
        const childLogger = new Logger(this.config);
        // Перехватываем все вызовы и добавляем метаданные
        const originalLog = childLogger.log.bind(childLogger);
        childLogger.log = async (level, message, childMeta) => {
            const combinedMeta = { ...meta, ...childMeta };
            return originalLog(level, message, combinedMeta);
        };
        return childLogger;
    }
}
Logger.instance = null;
//# sourceMappingURL=logger.js.map