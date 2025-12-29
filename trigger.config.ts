import { env } from "@src/env";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: env.TRIGGER_PROJECT_ID || env.APP_NAME,
  runtime: "bun",
  logLevel: "log",
  maxDuration: 300, // 5 minutes default max duration for tasks
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
});
