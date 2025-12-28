import { env } from "@src/env";
export {
  hasValue,
  getEnvValue,
  getOptionalEnvValue,
  buildFromSchema,
} from "./env-utils";
import { hasValue } from "./env-utils";

export const lower = (v: string) => v.toLowerCase();
export const json = (v: any) => JSON.stringify(v);
export const logMsg = (...parts: (string | object)[]) =>
  parts.map((p) => (typeof p === "string" ? p : json(p))).join(" ");
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

export const isDevEnv = () => env.NODE_ENV === "development";
