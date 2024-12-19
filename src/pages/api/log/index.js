import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const rotateTransport = new transports.DailyRotateFile({
  filename: "logs/%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      const logMessage = JSON.stringify(message, null, 2);
      return `${timestamp} [${level}] ${logMessage}`;
    })
  ),
  transports: [rotateTransport],
});

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  logger.info(req.body);

  return res.status(200).json({ message: "Log written successfully" });
}
