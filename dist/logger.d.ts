import { LogLevel, LoggerConfig, Transport } from './types.js';
/**
 * Основной класс логгера
 */
export declare class Logger {
    private config;
    private static instance;
    constructor(config?: Partial<LoggerConfig>);
    /**
     * Получить синглтон экземпляр логгера
     */
    static getInstance(config?: Partial<LoggerConfig>): Logger;
    /**
     * Сбросить синглтон экземпляр (для тестирования)
     */
    static resetInstance(): void;
    /**
     * Проверяет, должен ли лог быть записан
     */
    private shouldLog;
    /**
     * Создает контекст лога
     */
    private createLogContext;
    /**
     * Основной метод логирования
     */
    private log;
    /**
     * Логирование ошибок
     */
    error(message: string, meta?: any): Promise<void>;
    /**
     * Логирование предупреждений
     */
    warn(message: string, meta?: any): Promise<void>;
    /**
     * Логирование информации
     */
    info(message: string, meta?: any): Promise<void>;
    /**
     * Логирование отладочной информации
     */
    debug(message: string, meta?: any): Promise<void>;
    /**
     * Логирование трассировки
     */
    trace(message: string, meta?: any): Promise<void>;
    /**
     * Добавить новый транспорт
     */
    addTransport(transport: Transport): void;
    /**
     * Удалить транспорт по индексу
     */
    removeTransport(index: number): void;
    /**
     * Очистить все транспорты
     */
    clearTransports(): void;
    /**
     * Установить уровень логирования
     */
    setLevel(level: LogLevel): void;
    /**
     * Получить текущий уровень логирования
     */
    getLevel(): LogLevel;
    /**
     * Получить конфигурацию логгера
     */
    getConfig(): Readonly<LoggerConfig>;
    /**
     * Проверить, включен ли определенный уровень
     */
    isLevelEnabled(level: LogLevel): boolean;
    /**
     * Создать дочерний логгер с дополнительными метаданными
     */
    child(meta: any): Logger;
}
//# sourceMappingURL=logger.d.ts.map