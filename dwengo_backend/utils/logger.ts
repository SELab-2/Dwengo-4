import winston from "winston";
import expressWinston from "express-winston";

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    colorize(),
    timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat,
  ),
  transports: [new winston.transports.Console()],
});

const httpLogger = expressWinston.logger({
  transports: logger.transports,
  format: combine(colorize(), timestamp(), customFormat),
  meta: false,
  expressFormat: false,
  msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
  colorize: true,
});

export { logger, httpLogger };
