import { z } from "zod";
import { buildFromSchema, getEnvValue } from "@lib/utils";

const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  APP_PORT: z.coerce.number(),
  APP_NAME: z.coerce.string(),
});
export type EnvSchemaType = z.infer<typeof EnvSchema>;

export const env = EnvSchema.parse(buildFromSchema(EnvSchema, getEnvValue));
