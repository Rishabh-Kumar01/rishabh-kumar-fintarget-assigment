import winston from "winston";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: process.env.LOG_FILE_PATH,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, userId }) => {
          return `${timestamp} [${level}]: User ${userId} - ${message}`;
        })
      ),
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export const logTask = async (userId, message) => {
  logger.info(message, { userId });
};

export default logger;
