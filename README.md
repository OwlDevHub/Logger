# @OwlDevHub/Logger

Advanced logging library for Electron + React applications with automatic context and environment detection.

## 🚀 Features

- **Automatic context detection**: Main/Renderer process or Node.js
- **Automatic environment detection**: Development/Production
- **Electron support**: IPC transports for inter-process communication
- **Log file rotation**: Automatic file size and count management
- **Colored output**: Console color support (development only)
- **TypeScript**: Full type safety
- **Flexible architecture**: Transport system for extensibility

## 📦 Installation

### Option 1: Local Development (Recommended)

If you're working in a monorepo or local development:

```bash
# In your main project's package.json
{
  "dependencies": {
    "@OwlDevHub/Logger": "file:../Logger"
  }
}
```

### Option 2: Git Repository

```bash
# Install directly from Git repository
yarn add https://github.com/OwlDevHub/Logger.git

# Or in package.json
{
  "dependencies": {
    "@OwlDevHub/Logger": "github:OwlDevHub/Logger"
  }
}
```

### Option 3: Published Package (when available)

```bash
yarn add @OwlDevHub/Logger
```

### Build the Module

Before using the module, make sure it's built:

```bash
cd Logger
yarn install
yarn build
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { logger } from '@OwlDevHub/Logger';

// Simple logging
logger.info('Application started');
logger.warn('Warning message');
logger.error('Error occurred', { errorCode: 500 });
```

### Creating Custom Logger

```typescript
import { createLogger, LogLevel } from '@OwlDevHub/Logger';

const customLogger = createLogger({
  level: LogLevel.DEBUG,
  enableConsoleColors: true,
});

customLogger.debug('Debug information');
```

## 🔧 Configuration

### Automatic Detection

The library automatically detects:

- **Execution context**: `main`, `renderer` or `node`
- **Environment**: `development` or `production`
- **Log level**: `WARN` for production, `DEBUG` for development

### Manual Configuration

```typescript
import { createLogger, LogLevel, Environment, ExecutionContext } from '@OwlDevHub/Logger';

const logger = createLogger({
  level: LogLevel.INFO,
  context: ExecutionContext.MAIN,
  environment: Environment.PRODUCTION,
  enableConsoleColors: false,
  enableTimestamp: true,
  enableProcessInfo: true,
  maxLogFileSize: 10 * 1024 * 1024, // 10MB
  maxLogFiles: 5,
});
```

## 📝 Log Levels

```typescript
import { LogLevel } from '@OwlDevHub/Logger';

// From most important to least important
LogLevel.ERROR  // 0 - Critical errors
LogLevel.WARN   // 1 - Warnings
LogLevel.INFO   // 2 - Information
LogLevel.DEBUG  // 3 - Debug information
LogLevel.TRACE  // 4 - Trace information
```

## 🚚 Transports

### Console Transport (default)

```typescript
import { createConsoleTransport } from '@OwlDevHub/Logger';

const logger = createLogger({
  transports: [createConsoleTransport(true)] // true for colors
});
```

### File Transport

```typescript
import { createFileTransport } from '@OwlDevHub/Logger';

const fileTransport = createFileTransport({
  filePath: './logs/app.log',
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  format: 'json', // or 'text'
  encoding: 'utf8'
});

const logger = createLogger({
  transports: [fileTransport]
});
```

### IPC Transport (for Electron)

```typescript
import { createIpcTransport } from '@OwlDevHub/Logger';

// In renderer process
const ipcTransport = createIpcTransport('logger-channel');
const logger = createLogger({
  transports: [ipcTransport]
});

// In main process
import { createMainIpcTransport } from '@OwlDevHub/Logger';
const mainIpcTransport = createMainIpcTransport();
```

## 🔄 Child Loggers

```typescript
const userLogger = logger.child({ userId: '123', session: 'abc' });

userLogger.info('User performed action', { action: 'login' });
// Output: [INFO] User performed action { userId: '123', session: 'abc', action: 'login' }
```

## 🧪 Testing

```bash
# Run tests
yarn test

# Run tests with coverage
yarn test --coverage

# Linting
yarn lint
```

## 📁 Project Structure

```
src/
├── types.ts          # Types and interfaces
├── utils.ts          # Context detection utilities
├── transports.ts     # Logging transports
├── logger.ts         # Main logger class
├── index.ts          # Entry point
└── __tests__/        # Tests
    ├── setup.ts
    └── logger.test.ts
```

## 🔌 API

### Main Functions

- `createLogger(config?)` - Create new logger instance
- `getLogger()` - Get global instance
- `resetLogger()` - Reset global instance (for testing)

### Logger Methods

- `logger.error(message, meta?)` - Log errors
- `logger.warn(message, meta?)` - Log warnings
- `logger.info(message, meta?)` - Log information
- `logger.debug(message, meta?)` - Log debug info
- `logger.trace(message, meta?)` - Log trace info
- `logger.setLevel(level)` - Set log level
- `logger.getLevel()` - Get current level
- `logger.addTransport(transport)` - Add transport
- `logger.child(meta)` - Create child logger

## 🎨 Usage Examples

### In Electron Main Process

```typescript
import { createLogger, createFileTransport } from '@OwlDevHub/Logger';
import { app } from 'electron';
import path from 'path';

const logger = createLogger({
  context: 'main',
  transports: [
    createFileTransport({
      filePath: path.join(app.getPath('userData'), 'logs', 'main.log'),
      maxSize: 5 * 1024 * 1024,
      maxFiles: 3
    })
  ]
});

app.on('ready', () => {
  logger.info('Electron main process started');
});
```

### In React Component

```typescript
import { logger } from '@OwlDevHub/Logger';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    logger.info('Component mounted', { component: 'MyComponent' });
    
    return () => {
      logger.debug('Component will unmount');
    };
  }, []);
  
  const handleClick = () => {
    logger.trace('Button clicked', { buttonId: 'submit' });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### With Error Handling

```typescript
import { logger } from '@OwlDevHub/Logger';

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    logger.info('Data fetched successfully', { 
      url: '/api/data', 
      dataSize: data.length 
    });
    
    return data;
  } catch (error) {
    logger.error('Failed to fetch data', { 
      url: '/api/data', 
      error: error.message 
    });
    throw error;
  }
}
```

### Advanced Configuration Example

```typescript
import { createLogger, LogLevel, Environment, ExecutionContext, createFileTransport, createConsoleTransport } from '@OwlDevHub/Logger';

// Development configuration
const devLogger = createLogger({
  level: LogLevel.DEBUG,
  context: ExecutionContext.RENDERER,
  environment: Environment.DEVELOPMENT,
  enableConsoleColors: true,
  transports: [
    createConsoleTransport(true),
    createFileTransport({
      filePath: './logs/dev.log',
      maxSize: 5 * 1024 * 1024,
      maxFiles: 3,
      format: 'json'
    })
  ]
});

// Production configuration
const prodLogger = createLogger({
  level: LogLevel.WARN,
  context: ExecutionContext.MAIN,
  environment: Environment.PRODUCTION,
  enableConsoleColors: false,
  transports: [
    createFileTransport({
      filePath: './logs/prod.log',
      maxSize: 50 * 1024 * 1024,
      maxFiles: 10,
      format: 'json'
    })
  ]
});
```

### Custom Transport Example

```typescript
import { Transport, LogLevel } from '@OwlDevHub/Logger';

// Custom transport for external logging service
const externalServiceTransport: Transport = async (level, message, meta, context) => {
  try {
    await fetch('https://api.logging-service.com/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: LogLevel[level],
        message,
        meta,
        context,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('External logging service error:', error);
  }
};

const logger = createLogger({
  transports: [externalServiceTransport]
});
```

## 🔧 Troubleshooting

### ESM Import Issues

If you encounter ESM-related errors, make sure:

1. Your project has `"type": "module"` in package.json
2. You're using the correct import syntax
3. The module is properly built (`yarn build` in Logger directory)

### TypeScript Configuration

Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have questions or issues, create an issue in the repository or contact the author: night3098games@gmail.com
