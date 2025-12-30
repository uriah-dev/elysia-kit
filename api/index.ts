// Vercel serverless function entrypoint
// Using relative imports for Vercel compatibility
import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { html } from "@elysiajs/html";

// Re-export a minimal Elysia app for Vercel
// The full app uses path aliases which don't resolve on Vercel's Bun runtime

// Create a minimal app that works on Vercel
const app = new Elysia({ name: "elysia-kit-vercel" })
    .use(html())
    .use(openapi())
    .get("/", () => "Elysia Kit is running on Vercel!")
    .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }));

export default app;
