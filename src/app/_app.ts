import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { env } from "@src/env";
import { routes } from "./routes";
import { telemetry } from "@lib/telemetry";
import { logger } from "@src/lib/logger";

export const app = new Elysia({ name: env.APP_NAME })
  .derive({ as: "global" }, ({ server, request }) => ({
    log: logger,
    startTime: Date.now(),
    ip: server?.requestIP(request),
  }))
  .use(telemetry)
  .use(openapi())
  .use(routes);

export const server = app;
