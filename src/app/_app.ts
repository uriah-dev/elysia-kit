import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { env } from "@src/env";
import { telemetry } from "@lib/telemetry";
import { home } from "./routes/home";

export const app = new Elysia({ name: env.APP_NAME })
  .use(telemetry)
  .use(openapi())
  .use(home);

export const server = app;
