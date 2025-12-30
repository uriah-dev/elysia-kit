import pino from "pino";
import { env } from "@src/env";
import { buildServiceUrl, isDevEnv } from "./utils";

const getTransport = () => {
  const targets: pino.TransportTargetOptions[] = [];
  if (env.LOGGING_ENABLED && env.LOKI_PORT) {
    targets.push({
      target: "pino-loki",
      options: {
        batching: true,
        interval: 5,
        host: env.LOKI_URL || buildServiceUrl(env.LOKI_PORT),
        labels: {
          app: env.APP_NAME,
          env: env.NODE_ENV,
        },
        silenceErrors: false,
      },
      level: env.LOG_LEVEL,
    });
  }
  if (isDevEnv() || !env.LOGGING_ENABLED) {
    targets.push({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
      level: env.LOG_LEVEL,
    });
  }
  if (targets.length === 0) {
    return undefined;
  }

  return pino.transport({ targets });
};

export const logger = pino(
  {
    name: env.APP_NAME,
    level: env.LOG_LEVEL,
  },
  getTransport()
);

export type Logger = typeof logger;
