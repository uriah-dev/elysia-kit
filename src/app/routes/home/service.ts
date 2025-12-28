import { apiSuccess } from "@src/lib/common";
import type { PersonType } from "./schema";
import { addMetric } from "@src/lib/telemetry";
import type { HomeContext } from ".";
import { logMsg } from "@src/lib/utils";

export const sayHello = ({ logger, metric, ip }: HomeContext) => {
  addMetric(metric, { endpoint: "/", method: "GET" });
  logger.info(logMsg("Response success", { ip }));
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
  logger.info(logMsg("Person response success", { ip }));
  return apiSuccess(body);
};
