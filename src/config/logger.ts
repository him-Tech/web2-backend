import winston from "winston";
import { NodeEnv } from "./NodeEnv";
import { config } from "./config";

const enumerateErrorFormat = winston.format((info) => {
  Object.assign(info, { message: info.stack });
  return info;
});

export const logger = winston.createLogger({
  level: config.env === NodeEnv.Production ? "info" : "debug",
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === NodeEnv.Local
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});
