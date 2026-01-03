import { Elysia } from "elysia"; // Required for Vercel build detection
import { server } from "./app/_app";
// import { env } from "@src/env";
// import { logger } from "@lib/logger";
// import { buildServiceUrl } from "@lib/utils";

export type Server = typeof server;

// const PORT = env.APP_PORT;
// server.listen(PORT);

// logger.info(`🦊 Server is running at ${buildServiceUrl(PORT)}`);
const app = new Elysia().use(server);
export default app;