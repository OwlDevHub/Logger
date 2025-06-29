# Installation Guide

## Option 1: Local Development (Recommended)

If you're working in a monorepo or local development:

```bash
# In your main project's package.json
{
  "dependencies": {
    "@OwlDevHub/Logger": "file:../Logger"
  }
}
```

Or use relative path:

```bash
# If Logger is in the same repository
{
  "dependencies": {
    "@OwlDevHub/Logger": "file:./Logger"
  }
}
```

## Option 2: Git Repository (Development)

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

## Option 3: Published Package (Production)

```bash
# When published to npm
yarn add @OwlDevHub/Logger

# Or in package.json
{
  "dependencies": {
    "@OwlDevHub/Logger": "^2.1.3"
  }
}
```

## Usage

After installation, you can import the logger:

```typescript
import { logger } from '@OwlDevHub/Logger';

logger.info('Application started');
```

## Troubleshooting

### ESM Import Issues

If you encounter ESM-related errors, make sure:

1. Your project has `"type": "module"` in package.json
2. You're using the correct import syntax
3. The module is properly built (`yarn build` in Logger directory)

### Build the Module

Before using the module, make sure it's built:

```bash
cd Logger
yarn install
yarn build
```

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
