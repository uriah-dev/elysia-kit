import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { env } from "@src/env";
import { routes } from "./routes";

export const app = new Elysia({ name: env.APP_NAME })
  .derive({ as: "global" }, ({ server, request }) => ({
    ip: server?.requestIP(request),
  }))
  .use(openapi())
  .use(routes);

export const server = app;
