import { apiSuccess } from "@src/lib/common";
import type { PersonType } from "./schema";
import { logger } from "@src/lib/logger";
import { addMetric } from "@src/lib/telemetry";
import { metric } from ".";

export const sayHello = () => {
  addMetric(metric, { endpoint: "/", method: "GET" });
  logger.info("Response success");
  return "Hello Elysia";
};

export const sayHiPerson = ({ body }: { body: PersonType }) => {
  addMetric(metric, { endpoint: "/", method: "POST" });
  logger.info("Person response success");
  return apiSuccess(body);
};
