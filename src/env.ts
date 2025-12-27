import { z } from "zod";
import { buildFromSchema, getEnvValue } from "./lib/utils";

const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number(),
});
export type EnvSchemaType = z.infer<typeof EnvSchema>;

export const env = EnvSchema.parse(buildFromSchema(EnvSchema, getEnvValue));
