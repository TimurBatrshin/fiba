import { APP_SETTINGS } from '../config/envConfig';

// Определяем isProduction на основе хоста
const isProduction = window.location.hostname !== 'localhost';

/**
 * Logger levels for different types of logging
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Logger utility for standardized logging
 */
export class Logger {
  private static instance: Logger;
  private readonly enabled: boolean;
  private readonly logToServer: boolean;
  private readonly logsQueue: Array<{ level: LogLevel; message: string; data?: any; timestamp: Date }> = [];
  private sendingLogs = false;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.enabled = APP_SETTINGS.enableLogging;
    this.logToServer = isProduction;
    
    // Set up interval to flush logs to server
    if (this.logToServer) {
      setInterval(() => this.flushLogs(), 30000); // Every 30 seconds
    }
    
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
      });
    });
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  /**
   * Log an error message
   */
  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
  
  /**
   * Log a warning message
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  /**
   * Log an info message
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  /**
   * Log a debug message
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  /**
   * Internal method to handle logging
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.enabled && level !== LogLevel.ERROR) {
      return;
    }
    
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
    };
    
    // Log to console
    this.consoleLog(logEntry);
    
    // Queue log for server if in production
    if (this.logToServer && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
      this.logsQueue.push(logEntry);
      
      // If error, flush immediately
      if (level === LogLevel.ERROR) {
        this.flushLogs();
      }
    }
  }
  
  /**
   * Log to console with appropriate styling
   */
  private consoleLog(logEntry: { level: LogLevel; message: string; data?: any; timestamp: Date }): void {
    const { level, message, data, timestamp } = logEntry;
    const timeString = timestamp.toISOString();
    
    const styles = {
      [LogLevel.ERROR]: 'color: #FF5252; font-weight: bold;',
      [LogLevel.WARN]: 'color: #FFC107; font-weight: bold;',
      [LogLevel.INFO]: 'color: #2196F3;',
      [LogLevel.DEBUG]: 'color: #4CAF50;',
    };
    
    const prefix = `[${timeString}] [${level.toUpperCase()}]`;
    
    if (data) {
      console.log(`%c${prefix} ${message}`, styles[level], data);
    } else {
      console.log(`%c${prefix} ${message}`, styles[level]);
    }
  }
  
  /**
   * Send accumulated logs to the server
   */
  private async flushLogs(): Promise<void> {
    if (this.logsQueue.length === 0 || this.sendingLogs) {
      return;
    }
    
    this.sendingLogs = true;
    
    try {
      const logsToSend = [...this.logsQueue];
      this.logsQueue.length = 0;
      
      // In a real app, you would send these logs to your server
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ logs: logsToSend }),
      // });
      
      // For now, just log to console that we would have sent logs
      if (!isProduction) {
        console.log('Would have sent logs to server:', logsToSend);
      }
    } catch (error) {
      console.error('Failed to send logs to server:', error);
      
      // Put the logs back in the queue
      this.logsQueue.unshift(...this.logsQueue);
    } finally {
      this.sendingLogs = false;
    }
  }
}

// Create convenient exports
export const logger = Logger.getInstance();
export default logger; 