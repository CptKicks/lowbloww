import pino from 'pino';
import { config } from '../config/env';

const logger = pino({
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
    transport: config.nodeEnv === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
