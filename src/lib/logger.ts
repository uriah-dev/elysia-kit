import pino from "pino";
import { env } from "@src/env";
import { buildServiceUrl } from "./utils";

const getTransport = () => {
  const targets: pino.TransportTargetOptions[] = [
    {
      target: "pino-loki",
      options: {
        batching: true,
        interval: 5,
        host: buildServiceUrl(env.LOKI_PORT),
        labels: {
          app: env.APP_NAME,
          env: env.NODE_ENV,
        },
        silenceErrors: false,
      },
      level: env.LOG_LEVEL,
    },
  ];

  if (env.NODE_ENV === "development") {
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
