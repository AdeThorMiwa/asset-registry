import winston, { format } from 'winston';
import { Env } from '../config/env.js';

const Logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    level: Env.LOG_LEVEL,
    format: format.combine(format.splat(), format.json()),
});

export default Logger;