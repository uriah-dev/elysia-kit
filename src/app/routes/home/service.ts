import { apiSuccess } from "@src/lib/common";
import type { PersonType } from "./schema";
import { addMetric } from "@src/lib/telemetry";
import type { HomeContext } from ".";
import { json } from "@src/lib/utils";

export const sayHello = ({ logger, metric, ip }: HomeContext) => {
  addMetric(metric, { endpoint: "/", method: "GET" });
  logger.info("Response success " + json({ ip }));
  return "Hello Elysia";
};

export const sayHiPerson = ({
  body,
  logger,
  metric,
  ip,
}: HomeContext<{
  body: PersonType;
}>) => {
  addMetric(metric, { endpoint: "/", method: "POST" });
  logger.info("Person response success " + json({ ip }));
  return apiSuccess(body);
};
