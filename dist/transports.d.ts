import { Transport, FileTransportOptions } from './types.js';
/**
 * Консольный транспорт с цветами
 */
export declare function createConsoleTransport(enableColors?: boolean): Transport;
/**
 * Файловый транспорт с ротацией
 */
export declare function createFileTransport(options: FileTransportOptions): Transport;
/**
 * Транспорт для отправки логов в IPC (для Electron)
 */
export declare function createIpcTransport(channel?: string): Transport;
/**
 * Транспорт для отправки логов в main процесс (для Electron main)
 */
export declare function createMainIpcTransport(): Transport;
//# sourceMappingURL=transports.d.ts.map