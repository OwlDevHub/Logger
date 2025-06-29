import { Transport, LogContext, LogLevel, FileTransportOptions } from './types.js';
import { createColoredText, isFileSystemSupported } from './utils.js';

/**
 * Консольный транспорт с цветами
 */
export function createConsoleTransport(enableColors = true): Transport {
  return (level: LogLevel, message: string, meta?: any, context?: LogContext) => {
    const timestamp = context?.timestamp || new Date().toISOString();
    const levelName = context?.levelName || LogLevel[level];
    
    let prefix = `[${timestamp}] [${levelName}]`;
    
    if (enableColors) {
      const colorMap: Record<LogLevel, string> = {
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
        console.error(logMessage, meta || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, meta || '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, meta || '');
        break;
      default:
        console.log(logMessage, meta || '');
    }
  };
}

/**
 * Файловый транспорт с ротацией
 */
export function createFileTransport(options: FileTransportOptions): Transport {
  if (!isFileSystemSupported()) {
    console.warn('File transport is not supported in this environment');
    return () => {}; // Пустой транспорт
  }
  
  const {
    filePath,
    maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
    maxFiles = 5,
    format = 'json',
    encoding = 'utf8'
  } = options;
  
  // Динамический импорт fs для избежания проблем в renderer процессе
  let fs: any;
  let pathModule: any;
  
  try {
    fs = require('fs');
    pathModule = require('path');
  } catch (error) {
    console.warn('File system modules not available');
    return () => {};
  }
  
  // Создаем директорию, если она не существует
  const dir = pathModule.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
      return () => {};
    }
  }
  
  return async (level: LogLevel, message: string, meta?: any, context?: LogContext) => {
    try {
      // Проверяем размер файла
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > maxSize) {
          await rotateLogFile(fs, filePath, maxFiles);
        }
      }
      
      // Формируем запись лога
      const logEntry = {
        timestamp: context?.timestamp || new Date().toISOString(),
        level: context?.levelName || LogLevel[level],
        message,
        meta,
        context: context?.context,
        environment: context?.environment,
        processId: context?.processId,
        threadId: context?.threadId,
      };
      
      // Записываем в файл
      const logLine = format === 'json' 
        ? JSON.stringify(logEntry) + '\n'
        : `[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`;
      
      fs.appendFileSync(filePath, logLine, encoding);
      
    } catch (error) {
      console.error('File logging error:', error);
    }
  };
}

/**
 * Ротация лог файлов
 */
async function rotateLogFile(fs: any, filePath: string, maxFiles: number): Promise<void> {
  try {
    // Удаляем старые файлы
    for (let i = maxFiles - 1; i >= 0; i--) {
      const oldFile = i === 0 ? filePath : `${filePath}.${i}`;
      const newFile = `${filePath}.${i + 1}`;
      
      if (fs.existsSync(oldFile)) {
        if (i === maxFiles - 1) {
          // Удаляем самый старый файл
          fs.unlinkSync(oldFile);
        } else {
          // Переименовываем файл
          fs.renameSync(oldFile, newFile);
        }
      }
    }
  } catch (error) {
    console.error('Log rotation error:', error);
  }
}

/**
 * Транспорт для отправки логов в IPC (для Electron)
 */
export function createIpcTransport(channel = 'logger'): Transport {
  return (level: LogLevel, message: string, meta?: any, context?: LogContext) => {
    // Проверяем, доступен ли ipcRenderer
    if (typeof window !== 'undefined' && (window as any).electronAPI?.ipcRenderer) {
      try {
        (window as any).electronAPI.ipcRenderer.send(channel, {
          level,
          message,
          meta,
          context,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('IPC transport error:', error);
      }
    }
  };
}

/**
 * Транспорт для отправки логов в main процесс (для Electron main)
 */
export function createMainIpcTransport(): Transport {
  return (_level: LogLevel, message: string, meta?: any) => {
    // Проверяем, доступен ли ipcMain
    if (typeof process !== 'undefined' && (process as any).type === 'browser') {
      try {
        // Отправляем всем renderer процессам
        // Это упрощенная версия, в реальности нужно отслеживать окна
        console.log(`[IPC] ${message}`, meta);
      } catch (error) {
        console.error('Main IPC transport error:', error);
      }
    }
  };
}

/**
 * Автоматический IPC транспорт - автоматически определяет контекст и настраивает пересылку
 */
export function createAutoIpcTransport(channel = 'logger'): Transport {
  return (level: LogLevel, message: string, meta?: any, context?: LogContext) => {
    const executionContext = context?.context;
    
    if (executionContext === 'renderer') {
      // В renderer процессе - отправляем в main
      if (typeof window !== 'undefined' && (window as any).electronAPI?.ipcRenderer) {
        try {
          (window as any).electronAPI.ipcRenderer.send(channel, {
            level,
            message,
            meta,
            context,
            timestamp: new Date().toISOString(),
            source: 'renderer'
          });
        } catch (error) {
          console.error('Auto IPC transport error (renderer):', error);
        }
      }
    } else if (executionContext === 'main') {
      // В main процессе - выводим в терминал
      const timestamp = context?.timestamp || new Date().toISOString();
      const levelName = context?.levelName || LogLevel[level];
      const prefix = `[${timestamp}] [${levelName}] [MAIN]`;
      const logMessage = `${prefix} ${message}`;
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, meta || '');
          break;
        case LogLevel.WARN:
          console.warn(logMessage, meta || '');
          break;
        case LogLevel.INFO:
          console.info(logMessage, meta || '');
          break;
        default:
          console.log(logMessage, meta || '');
      }
    }
  };
}

/**
 * Глобальный IPC обработчик для main процесса
 * Должен быть вызван в main процессе для приема логов от renderer
 */
export function setupMainIpcHandler(channel = 'logger') {
  if (typeof process === 'undefined' || (process as any).type !== 'browser') {
    return;
  }
  
  try {
    const { ipcMain } = require('electron');
    
    ipcMain.on(channel, (_event: any, logData: any) => {
      const { level, message, meta, timestamp } = logData;
      const levelName = LogLevel[level];
      const prefix = `[${timestamp}] [${levelName}] [RENDERER]`;
      const logMessage = `${prefix} ${message}`;
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, meta || '');
          break;
        case LogLevel.WARN:
          console.warn(logMessage, meta || '');
          break;
        case LogLevel.INFO:
          console.info(logMessage, meta || '');
          break;
        default:
          console.log(logMessage, meta || '');
      }
    });
    
    console.log(`[LOGGER] IPC handler set up for channel: ${channel}`);
  } catch (error) {
    console.error('Failed to setup IPC handler:', error);
  }
} 
