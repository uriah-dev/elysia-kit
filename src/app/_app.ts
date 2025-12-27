import { Elysia } from "elysia";
import { openapi, fromTypes } from "@elysiajs/openapi";
import { env } from "@src/env";
import { home } from "./routes/home";

const app = new Elysia({ name: env.APP_NAME })
  .derive({ as: "global" }, ({ server, request }) => ({
    ip: server?.requestIP(request),
  }))
  .use(
    openapi({
      references: fromTypes(),
    })
  );

home.use(app);

export const server = new Elysia().use(home);

export { app };
