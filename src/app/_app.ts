import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { env } from "@src/env";
import { routes } from "./routes";
import { telemetry } from "@lib/telemetry";

export const app = new Elysia({ name: env.APP_NAME })
  .use(telemetry)
  .use(openapi())
  .use(routes);

export const server = app;
