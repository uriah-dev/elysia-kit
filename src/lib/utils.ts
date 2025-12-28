import { env } from "@src/env";
import z from "zod";

export const hasValue = (value: unknown): value is string => {
  return value !== 0 && !!value;
};

export const getEnvValue = (key: string) => {
  const value = Bun.env[key];
  if (!hasValue(value)) {
    throw new ReferenceError(`${key}: Missing Env Variable`);
  }
  return value;
};

export const getOptionalEnvValue = (key: string) => {
  const value = Bun.env[key];
  return hasValue(value) ? value : undefined;
};

export const buildFromSchema = <T extends z.ZodObject<any>>(
  schema: T,
  getValue: (key: string) => string | undefined
): Record<string, string | undefined> => {
  return Object.keys(schema.shape).reduce((acc, key) => {
    acc[key] = getValue(key);
    return acc;
  }, {} as Record<string, string | undefined>);
};

export const lower = (v: string) => v.toLowerCase();
export const json = (v: any) => JSON.stringify(v);
export const getRoutePrefix = (name: string) => lower(name);

export const getMetricKey = (routeName: string, metricName?: string) =>
  `${lower(routeName)}${hasValue(metricName) ? "_" + metricName : "_route"}`;

export const getRouteName = () => `${env.APP_NAME}_routes`;

export const getBaseUrl = () => {
  const url = new URL(env.APP_URL);
  return `${url.protocol}//${url.hostname}`;
};

export const getProtocol = () => {
  const url = new URL(env.APP_URL);
  // Remove trailing ':'
  return url.protocol.slice(0, -1);
};

export const buildServiceUrl = (port: number, path = "") => {
  const base = getBaseUrl();
  return `${base}:${port}${path}`;
};
