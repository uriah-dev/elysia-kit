import { apiSuccess } from "@src/lib/common";
import type { PersonType } from "./schema";
import { addMetric } from "@src/lib/telemetry";
import type { HomeContext } from ".";

export const sayHello = ({ logger, metric }: HomeContext) => {
  addMetric(metric, { endpoint: "/", method: "GET" });
  logger.info("Response success");
  return "Hello Elysia";
};

export const sayHiPerson = ({
  body,
  logger,
  metric,
}: HomeContext<{
  body: PersonType;
}>) => {
  addMetric(metric, { endpoint: "/", method: "POST" });
  logger.info("Person response success");
  return apiSuccess(body);
};
