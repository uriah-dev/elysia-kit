import { Elysia } from "elysia";

/**
 * Health check routes for Kubernetes probes
 */
export const health = new Elysia({ prefix: "/health" })
    .get("/", () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
    }))
    .get("/live", () => ({
        status: "ok",
    }))
    .get("/ready", () => ({
        status: "ok",
    }));
