/**
 * Logger Utility
 * Centralized logging for the application
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Get timestamp string
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message
 */
const formatMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    formattedMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
  }
  
  return formattedMessage;
};

/**
 * Logger class with different log levels
 */
class Logger {
  static info(message, data = null) {
    const formattedMessage = formatMessage('info', message, data);
    console.log(`${colors.cyan}${formattedMessage}${colors.reset}`);
  }

  static success(message, data = null) {
    const formattedMessage = formatMessage('success', message, data);
    console.log(`${colors.green}${formattedMessage}${colors.reset}`);
  }

  static warn(message, data = null) {
    const formattedMessage = formatMessage('warn', message, data);
    console.warn(`${colors.yellow}${formattedMessage}${colors.reset}`);
  }

  static error(message, error = null) {
    const formattedMessage = formatMessage('error', message);
    console.error(`${colors.red}${formattedMessage}${colors.reset}`);
    
    if (error) {
      console.error(`${colors.red}Error Details:${colors.reset}`, error);
      if (error.stack) {
        console.error(`${colors.dim}Stack Trace:${colors.reset}`, error.stack);
      }
    }
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = formatMessage('debug', message, data);
      console.log(`${colors.magenta}${formattedMessage}${colors.reset}`);
    }
  }

  static auth(message, data = null) {
    const formattedMessage = formatMessage('auth', message, data);
    console.log(`${colors.blue}${formattedMessage}${colors.reset}`);
  }

  static db(message, data = null) {
    const formattedMessage = formatMessage('database', message, data);
    console.log(`${colors.cyan}${formattedMessage}${colors.reset}`);
  }
}

export default Logger;