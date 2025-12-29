import { renderToReadableStream } from "react-dom/server";
import { createElement } from "react";
import { apiSuccess } from "@src/lib/common";
import type { PersonType } from "./schema";
import { addMetric } from "@src/lib/telemetry";
import type { HomeContext } from ".";
import { Home } from "@src/app/components/home";


export const sayHello = async ({ logger, metric }: HomeContext) => {
  addMetric(metric, { endpoint: "/", method: "GET" });
  logger.info("Response success");

  const stream = await renderToReadableStream(createElement(Home));

  return new Response(stream, {
    headers: { "Content-Type": "text/html" },
  });
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
