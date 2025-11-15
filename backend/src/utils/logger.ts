type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, ...args);
        break;
      case 'warn':
        console.warn(logMessage, ...args);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, ...args);
        }
        break;
      default:
        console.log(logMessage, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }
}

export default new Logger();

