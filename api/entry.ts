// Vercel-specific app configuration
// Uses relative imports instead of path aliases for Vercel compatibility
import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { html } from "@elysiajs/html";
import { env } from "../src/env";
import { telemetry } from "../src/lib/telemetry";
import { home } from "../src/app/routes/home";
import { user } from "../src/app/routes/user";
import { health } from "../src/app/routes/health";

const app = new Elysia({ name: env.APP_NAME })
    .use(html())
    .use(telemetry)
    .use(openapi())
    .use(health)
    .use(home)
    .use(user);

export default app;
