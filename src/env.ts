import { z } from "zod";
import { buildFromSchema, getEnvValue } from "@lib/env-utils";

const EnvSchema = z.object({
  DATABASE_URL: z.string(),
  APP_PORT: z.coerce.number(),
  APP_NAME: z.coerce.string(),
  APP_URL: z.url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  // Trigger.dev
  TRIGGER_SECRET_KEY: z.string().optional(),
  TRIGGER_PROJECT_ID: z.string().optional(), // Project ID or name in Trigger.dev

  // Email
  RESEND_API_KEY: z.string(),
  RESEND_MAIL: z.email(),

  // Observability feature flags
  TRACING_ENABLED: z.enum(["TRUE", "FALSE"]).default("TRUE").transform((v) => v === "TRUE"),
  METRICS_ENABLED: z.enum(["TRUE", "FALSE"]).default("TRUE").transform((v) => v === "TRUE"),
  LOGGING_ENABLED: z.enum(["TRUE", "FALSE"]).default("TRUE").transform((v) => v === "TRUE"),

  // Telemetry ports
  TEMPO_UI_PORT: z.coerce.number().default(3200),
  TEMPO_OTLP_GRPC_PORT: z.coerce.number().default(4317),
  TEMPO_OTLP_HTTP_PORT: z.coerce.number().default(4318),
  PROMETHEUS_PORT: z.coerce.number().default(9090),
  LOKI_PORT: z.coerce.number().default(3100),
  GRAFANA_PORT: z.coerce.number().default(3001),
  METRICS_EXPORTER_PORT: z.coerce.number().default(9464),

  // Telemetry service URLs
  TEMPO_URL: z.url().optional(),
  LOKI_URL: z.url().optional(),

  // Arcjet
  ARCJET_KEY: z.string().optional(),
  ARCJET_ENV: z.enum(["development", "production"]).default("development").optional(),
});
export type EnvSchemaType = z.infer<typeof EnvSchema>;

export const env = EnvSchema.parse(
  buildFromSchema(EnvSchema, getEnvValue(EnvSchema))
);
