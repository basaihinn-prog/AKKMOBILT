/**
 * Production-grade logging system with request/response tracking and error reporting
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  duration: number;
  userId?: string;
  error?: {
    message: string;
    code?: string;
  };
}

class Logger {
  private logs: LogEntry[] = [];
  private requestLogs: RequestLog[] = [];
  private maxLogs = 10000;
  private isProduction = process.env.NODE_ENV === 'production';

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.consoleOutput(level, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      },
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.consoleOutput('error', message, context);
    if (!this.isProduction) {
      console.error(errorObj);
    }
  }

  logRequest(method: string, path: string, startTime: number, statusCode?: number, error?: { message: string; code?: string }): void {
    const duration = Date.now() - startTime;
    const requestLog: RequestLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      method,
      path,
      statusCode,
      duration,
      error,
    };

    this.requestLogs.push(requestLog);
    if (this.requestLogs.length > this.maxLogs) {
      this.requestLogs.shift();
    }

    if (!this.isProduction) {
      const emoji = statusCode && statusCode < 400 ? '✓' : '✗';
      console.log(
        `${emoji} [${method}] ${path} - ${statusCode || '?'} (${duration}ms)`
      );
    }
  }

  private consoleOutput(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (this.isProduction && level === 'debug') return;

    const levelEmoji: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };

    const emoji = levelEmoji[level];
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    console.log(`${emoji} [${level.toUpperCase()}] ${message}${contextStr}`);
  }

  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }
    return filtered.slice(-limit);
  }

  getRequestLogs(limit = 100): RequestLog[] {
    return this.requestLogs.slice(-limit);
  }

  getMetrics(): {
    totalLogs: number;
    errorCount: number;
    warnCount: number;
    avgRequestDuration: number;
    requestCount: number;
  } {
    const errorCount = this.logs.filter((log) => log.level === 'error').length;
    const warnCount = this.logs.filter((log) => log.level === 'warn').length;
    const avgRequestDuration = this.requestLogs.length > 0
      ? this.requestLogs.reduce((sum, log) => sum + log.duration, 0) / this.requestLogs.length
      : 0;

    return {
      totalLogs: this.logs.length,
      errorCount,
      warnCount,
      avgRequestDuration,
      requestCount: this.requestLogs.length,
    };
  }

  clear(): void {
    this.logs = [];
    this.requestLogs = [];
  }
}

export const logger = new Logger();
