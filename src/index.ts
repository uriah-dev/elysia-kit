import { server } from "@app/_app";
import { env } from "@src/env";
import { logger } from "./lib/logger";

server.listen(env.APP_PORT);

const config = {
  hostname: server.server?.hostname,
  port: server.server?.port,
};

logger.info(`🦊 Server is running at ${config?.hostname}:${config?.port}`);

export type Server = typeof server;
