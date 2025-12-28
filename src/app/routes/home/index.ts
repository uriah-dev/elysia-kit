import { Elysia } from "elysia";
import { sayHello, sayHiPerson } from "./service";
import { PersonSchema } from "./schema";
import { createCounter } from "@lib/telemetry";
import { getRoutePrefix, getMetricKey } from "@src/lib/utils";

const ROUTE_NAME = "Home";
export const config = {
  name: ROUTE_NAME,
  prefix: getRoutePrefix(ROUTE_NAME),
};

export const home = new Elysia(config);
export const metric = createCounter(getMetricKey(ROUTE_NAME));

home.get("/", sayHello);
home.post("/", sayHiPerson, {
  body: PersonSchema,
});
