// Custom logging middleware
export interface LogEvent {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  source?: string;
}

class Logger {
  private logs: LogEvent[] = [];
  private maxLogs = 1000;

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addLog(level: LogEvent['level'], message: string, data?: any, source?: string): void {
    const logEvent: LogEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      message,
      data,
      source
    };

    this.logs.unshift(logEvent);
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in localStorage for persistence
    this.saveLogs();
  }

  private saveLogs(): void {
    try {
      localStorage.setItem('app-logs', JSON.stringify(this.logs));
    } catch (error) {
      // Fallback if localStorage is full
    }
  }

  private loadLogs(): void {
    try {
      const storedLogs = localStorage.getItem('app-logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      this.logs = [];
    }
  }

  info(message: string, data?: any, source?: string): void {
    this.addLog('info', message, data, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.addLog('warn', message, data, source);
  }

  error(message: string, data?: any, source?: string): void {
    this.addLog('error', message, data, source);
  }

  debug(message: string, data?: any, source?: string): void {
    this.addLog('debug', message, data, source);
  }

  getLogs(): LogEvent[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('app-logs');
  }

  constructor() {
    this.loadLogs();
  }
}

export const logger = new Logger();