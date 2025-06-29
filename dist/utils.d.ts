import { ExecutionContext, Environment } from './types.js';
declare global {
    interface Window {
        process?: {
            type?: string;
        };
    }
    var process: NodeJS.Process | undefined;
}
/**
 * Определяет контекст выполнения (main/renderer/node)
 */
export declare function detectExecutionContext(): ExecutionContext;
/**
 * Определяет окружение (development/production)
 */
export declare function detectEnvironment(): Environment;
/**
 * Получает информацию о процессе
 */
export declare function getProcessInfo(): {
    processId: undefined;
    threadId: undefined;
} | {
    processId: number;
    threadId: number;
};
/**
 * Создает цветной текст для консоли
 */
export declare function createColoredText(text: string, color: string): string;
/**
 * Форматирует размер файла в читаемый вид
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Проверяет, поддерживается ли файловая система
 */
export declare function isFileSystemSupported(): boolean;
//# sourceMappingURL=utils.d.ts.map