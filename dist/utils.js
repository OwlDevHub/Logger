import { ExecutionContext, Environment } from './types.js';
/**
 * Определяет контекст выполнения (main/renderer/node)
 */
export function detectExecutionContext() {
    // Проверяем, находимся ли мы в Electron
    if (typeof window !== 'undefined' && window.process?.type) {
        return window.process.type === 'renderer'
            ? ExecutionContext.RENDERER
            : ExecutionContext.MAIN;
    }
    // Проверяем, есть ли process в глобальной области
    if (typeof process !== 'undefined' && process.type) {
        return process.type === 'renderer'
            ? ExecutionContext.RENDERER
            : ExecutionContext.MAIN;
    }
    // Если есть process, но нет type, то это Node.js
    if (typeof process !== 'undefined') {
        return ExecutionContext.NODE;
    }
    // По умолчанию считаем, что это renderer процесс
    return ExecutionContext.RENDERER;
}
/**
 * Определяет окружение (development/production)
 */
export function detectEnvironment() {
    // Проверяем NODE_ENV
    if (typeof process !== 'undefined' && process.env.NODE_ENV) {
        return process.env.NODE_ENV === 'production'
            ? Environment.PRODUCTION
            : Environment.DEVELOPMENT;
    }
    // Проверяем другие переменные окружения
    if (typeof process !== 'undefined') {
        if (process.env.ELECTRON_IS_DEV) {
            return Environment.DEVELOPMENT;
        }
        if (process.env.ELECTRON_IS_PROD) {
            return Environment.PRODUCTION;
        }
    }
    // По умолчанию считаем, что это development
    return Environment.DEVELOPMENT;
}
/**
 * Получает информацию о процессе
 */
export function getProcessInfo() {
    if (typeof process === 'undefined') {
        return { processId: undefined, threadId: undefined };
    }
    return {
        processId: process.pid,
        threadId: process.pid, // В Node.js нет отдельного threadId
    };
}
/**
 * Создает цветной текст для консоли
 */
export function createColoredText(text, color) {
    const colors = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        reset: '\x1b[0m',
    };
    return `${colors[color] || ''}${text}${colors.reset}`;
}
/**
 * Форматирует размер файла в читаемый вид
 */
export function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
/**
 * Проверяет, поддерживается ли файловая система
 */
export function isFileSystemSupported() {
    return typeof process !== 'undefined' &&
        typeof require !== 'undefined' &&
        typeof window === 'undefined';
}
//# sourceMappingURL=utils.js.map