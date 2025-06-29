import { LogLevel } from './types.js';
import { createColoredText, isFileSystemSupported } from './utils.js';
/**
 * Консольный транспорт с цветами
 */
export function createConsoleTransport(enableColors = true) {
    return (level, message, meta, context) => {
        const timestamp = context?.timestamp ?? new Date().toISOString();
        const levelName = context?.levelName ?? LogLevel[level];
        let prefix = `[${timestamp}] [${levelName}]`;
        if (enableColors) {
            const colorMap = {
                [LogLevel.ERROR]: 'red',
                [LogLevel.WARN]: 'yellow',
                [LogLevel.INFO]: 'green',
                [LogLevel.DEBUG]: 'blue',
                [LogLevel.TRACE]: 'cyan',
            };
            prefix = createColoredText(prefix, colorMap[level]);
        }
        const logMessage = `${prefix} ${message}`;
        switch (level) {
            case LogLevel.ERROR:
                console.error(logMessage, meta ?? '');
                break;
            case LogLevel.WARN:
                console.warn(logMessage, meta ?? '');
                break;
            case LogLevel.INFO:
                console.info(logMessage, meta ?? '');
                break;
            default:
                console.log(logMessage, meta ?? '');
        }
    };
}
/**
 * Инициализация файловой системы
 */
function initializeFileSystem() {
    try {
        const fs = require('fs');
        const pathModule = require('path');
        return { fs, pathModule };
    }
    catch (error) {
        console.warn('File system modules not available');
        return null;
    }
}
/**
 * Создание директории для логов
 */
function ensureLogDirectory(fs, pathModule, filePath) {
    const dir = pathModule.dirname(filePath);
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
            return true;
        }
        catch (error) {
            console.error('Failed to create log directory:', error);
            return false;
        }
    }
    return true;
}
/**
 * Проверка и ротация файла логов
 */
async function checkAndRotateFile(fs, filePath, maxSize, maxFiles) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > maxSize) {
            await rotateLogFile(fs, filePath, maxFiles);
        }
    }
}
/**
 * Создание записи лога
 */
function createLogEntry(level, message, meta, context) {
    return {
        timestamp: context?.timestamp ?? new Date().toISOString(),
        level: context?.levelName ?? LogLevel[level],
        message,
        meta,
        context: context?.context,
        environment: context?.environment,
        processId: context?.processId,
        threadId: context?.threadId,
    };
}
/**
 * Форматирование строки лога
 */
function formatLogLine(logEntry, format, meta) {
    if (format === 'json') {
        return JSON.stringify(logEntry) + '\n';
    }
    const metaString = meta ? ' ' + JSON.stringify(meta) : '';
    const formattedMessage = `[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.message}${metaString}\n`;
    return formattedMessage;
}
/**
 * Файловый транспорт с ротацией
 */
export function createFileTransport(options) {
    if (!isFileSystemSupported()) {
        console.warn('File transport is not supported in this environment');
        return () => { }; // Пустой транспорт
    }
    const { filePath, maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
    maxFiles = 5, format = 'json', encoding = 'utf8' } = options;
    // Инициализация файловой системы
    const fileSystem = initializeFileSystem();
    if (!fileSystem) {
        return () => { };
    }
    const { fs, pathModule } = fileSystem;
    // Создание директории
    if (!ensureLogDirectory(fs, pathModule, filePath)) {
        return () => { };
    }
    return async (level, message, meta, context) => {
        try {
            await checkAndRotateFile(fs, filePath, maxSize, maxFiles);
            const logEntry = createLogEntry(level, message, meta, context);
            const logLine = formatLogLine(logEntry, format, meta);
            fs.appendFileSync(filePath, logLine, encoding);
        }
        catch (error) {
            console.error('File logging error:', error);
        }
    };
}
/**
 * Ротация лог файлов
 */
async function rotateLogFile(fs, filePath, maxFiles) {
    try {
        // Удаляем старые файлы
        for (let i = maxFiles - 1; i >= 0; i--) {
            const oldFile = i === 0 ? filePath : `${filePath}.${i}`;
            const newFile = `${filePath}.${i + 1}`;
            if (fs.existsSync(oldFile)) {
                if (i === maxFiles - 1) {
                    // Удаляем самый старый файл
                    fs.unlinkSync(oldFile);
                }
                else {
                    // Переименовываем файл
                    fs.renameSync(oldFile, newFile);
                }
            }
        }
    }
    catch (error) {
        console.error('Log rotation error:', error);
    }
}
/**
 * Транспорт для отправки логов в IPC (для Electron)
 */
export function createIpcTransport(channel = 'logger') {
    return (level, message, meta, context) => {
        // Проверяем, доступен ли ipcRenderer
        if (typeof window !== 'undefined' && window.electronAPI?.ipcRenderer) {
            try {
                window.electronAPI.ipcRenderer.send(channel, {
                    level,
                    message,
                    meta,
                    context,
                    timestamp: new Date().toISOString(),
                });
            }
            catch (error) {
                console.error('IPC transport error:', error);
            }
        }
    };
}
/**
 * Транспорт для отправки логов в main процесс (для Electron main)
 */
export function createMainIpcTransport() {
    return (_level, message, meta) => {
        // Проверяем, доступен ли ipcMain
        if (typeof process !== 'undefined' && process.type === 'browser') {
            try {
                // Отправляем всем renderer процессам
                // Это упрощенная версия, в реальности нужно отслеживать окна
                console.log(`[IPC] ${message}`, meta);
            }
            catch (error) {
                console.error('Main IPC transport error:', error);
            }
        }
    };
}
/**
 * Автоматический IPC транспорт - автоматически определяет контекст и настраивает пересылку
 */
export function createAutoIpcTransport(channel = 'logger') {
    return (level, message, meta, context) => {
        const executionContext = context?.context;
        if (executionContext === 'renderer') {
            // В renderer процессе - отправляем в main
            if (typeof window !== 'undefined' && window.electronAPI?.ipcRenderer) {
                try {
                    window.electronAPI.ipcRenderer.send(channel, {
                        level,
                        message,
                        meta,
                        context,
                        timestamp: new Date().toISOString(),
                        source: 'renderer'
                    });
                }
                catch (error) {
                    console.error('Auto IPC transport error (renderer):', error);
                }
            }
        }
        else if (executionContext === 'main') {
            // В main процессе - выводим в терминал
            const timestamp = context?.timestamp ?? new Date().toISOString();
            const levelName = context?.levelName ?? LogLevel[level];
            const prefix = `[${timestamp}] [${levelName}] [MAIN]`;
            const logMessage = `${prefix} ${message}`;
            switch (level) {
                case LogLevel.ERROR:
                    console.error(logMessage, meta ?? '');
                    break;
                case LogLevel.WARN:
                    console.warn(logMessage, meta ?? '');
                    break;
                case LogLevel.INFO:
                    console.info(logMessage, meta ?? '');
                    break;
                default:
                    console.log(logMessage, meta ?? '');
            }
        }
    };
}
/**
 * Глобальный IPC обработчик для main процесса
 * Должен быть вызван в main процессе для приема логов от renderer
 */
export function setupMainIpcHandler(channel = 'logger') {
    if (typeof process === 'undefined' || process.type !== 'browser') {
        return;
    }
    try {
        const { ipcMain } = require('electron');
        ipcMain.on(channel, (_event, logData) => {
            const { level, message, meta, timestamp } = logData;
            const levelName = LogLevel[level];
            const prefix = `[${timestamp}] [${levelName}] [RENDERER]`;
            const logMessage = `${prefix} ${message}`;
            switch (level) {
                case LogLevel.ERROR:
                    console.error(logMessage, meta ?? '');
                    break;
                case LogLevel.WARN:
                    console.warn(logMessage, meta ?? '');
                    break;
                case LogLevel.INFO:
                    console.info(logMessage, meta ?? '');
                    break;
                default:
                    console.log(logMessage, meta ?? '');
            }
        });
        console.log(`[LOGGER] IPC handler set up for channel: ${channel}`);
    }
    catch (error) {
        console.error('Failed to setup IPC handler:', error);
    }
}
//# sourceMappingURL=transports.js.map