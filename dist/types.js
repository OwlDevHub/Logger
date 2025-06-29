/**
 * Уровни логирования
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
    LogLevel[LogLevel["TRACE"] = 4] = "TRACE";
})(LogLevel || (LogLevel = {}));
/**
 * Контекст выполнения (Electron main/renderer или Node.js)
 */
export var ExecutionContext;
(function (ExecutionContext) {
    ExecutionContext["MAIN"] = "main";
    ExecutionContext["RENDERER"] = "renderer";
    ExecutionContext["NODE"] = "node";
})(ExecutionContext || (ExecutionContext = {}));
/**
 * Режим работы приложения
 */
export var Environment;
(function (Environment) {
    Environment["DEVELOPMENT"] = "development";
    Environment["PRODUCTION"] = "production";
})(Environment || (Environment = {}));
//# sourceMappingURL=types.js.map