// Environment-aware logging utility
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };
  
  const getCurrentLogLevel = () => {
    // Only log errors in production
    if (process.env.NODE_ENV === 'production') {
      return LOG_LEVELS.ERROR;
    }
    // Log everything in development
    return LOG_LEVELS.DEBUG;
  };
  
  class Logger {
    static currentLogLevel = getCurrentLogLevel();
  
    static formatMessage(level, message, ...args) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] ${level}:`;
      
      if (args.length > 0) {
        return [prefix, message, ...args];
      }
      return [prefix, message];
    }
  
    static debug(message, ...args) {
      if (this.currentLogLevel <= LOG_LEVELS.DEBUG) {
        console.debug(...this.formatMessage('DEBUG', message, ...args));
      }
    }
  
    static info(message, ...args) {
      if (this.currentLogLevel <= LOG_LEVELS.INFO) {
        console.info(...this.formatMessage('INFO', message, ...args));
      }
    }
  
    static warn(message, ...args) {
      if (this.currentLogLevel <= LOG_LEVELS.WARN) {
        console.warn(...this.formatMessage('WARN', message, ...args));
      }
    }
  
    static error(message, error, ...args) {
      if (this.currentLogLevel <= LOG_LEVELS.ERROR) {
        console.error(
          ...this.formatMessage('ERROR', message, error?.message || error, ...args),
          error?.stack || ''
        );
      }
    }
  
    // For tracking user actions
    static trackAction(action, details) {
      this.info('USER_ACTION', { action, details });
      // You could also send this to an analytics service
    }
  
    // For tracking API calls
    static trackAPI(method, endpoint, status, duration) {
      this.debug('API_CALL', { method, endpoint, status, duration });
    }
  
    // For tracking performance
    static trackPerformance(operation, duration) {
      this.debug('PERFORMANCE', { operation, duration: `${duration}ms` });
    }
  }
  
  export default Logger;