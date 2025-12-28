import pino from "pino";
import { env } from "@src/env";

export const logger = pino({
  name: env.APP_NAME,
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export type Logger = typeof logger;
