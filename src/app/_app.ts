import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { html } from "@elysiajs/html";
import { env } from "@src/env";
import { telemetry } from "@lib/telemetry";
import { home } from "@routes/home";
import { user } from "@routes/user";
import { health } from "@routes/health";

export const app = new Elysia({ name: env.APP_NAME })
  .use(html())
  .use(telemetry)
  .use(openapi())
  .use(health)
  .use(home)
  .use(user);

export const server = app;
