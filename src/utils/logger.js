
const formatMessage = (level, message, meta) => {
  const baseMessage = `[${new Date().toISOString()}] [${level}] ${message}`;

  if (!meta) {
    return baseMessage;
  }

  return `${baseMessage} ${JSON.stringify(meta)}`;
};

export const logger = {
  info: (message, meta = null) => {
    if (process.env.ENVIRONMENT !== 'test') {
      console.log(formatMessage('INFO', message, meta));
    }
  },
  warn: (message, meta = null) => {
    if (process.env.ENVIRONMENT  !== 'test') {
      console.warn(formatMessage('WARN', message, meta));
    }
  },
  error: (message, meta = null) => {
    if (process.env.ENVIRONMENT !== 'test') {
      console.error(formatMessage('ERROR', message, meta));
    }
  },
};
