/**
 * Уровни логирования
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

/**
 * Контекст выполнения (Electron main/renderer или Node.js)
 */
export enum ExecutionContext {
  MAIN = 'main',
  RENDERER = 'renderer',
  NODE = 'node',
}

/**
 * Режим работы приложения
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

/**
 * Интерфейс для транспорта логирования
 */
export interface Transport {
  (level: LogLevel, message: string, meta?: any, context?: LogContext): void | Promise<void>;
}

/**
 * Контекст лога
 */
export interface LogContext {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  meta?: any;
  context: ExecutionContext;
  environment: Environment;
  processId?: number;
  threadId?: number;
}

/**
 * Конфигурация логгера
 */
export interface LoggerConfig {
  level: LogLevel;
  transports: Transport[];
  context: ExecutionContext;
  environment: Environment;
  enableConsoleColors?: boolean;
  enableTimestamp?: boolean;
  enableProcessInfo?: boolean;
  maxLogFileSize?: number; // в байтах
  maxLogFiles?: number;
}

/**
 * Опции для файлового транспорта
 */
export interface FileTransportOptions {
  filePath: string;
  maxSize?: number; // в байтах
  maxFiles?: number;
  format?: 'json' | 'text';
  encoding?: string;
} 
