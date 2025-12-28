import { Elysia } from "elysia";
import { sayHello, sayHiPerson } from "./service";
import { PersonSchema } from "./schema";
import { createCounter } from "@lib/telemetry";
import { getMetricKey } from "@src/lib/utils";
import { type Context, routes } from "@routes/index";

export type HomeContext<T = {}> = Context<
  {
    metric: ReturnType<typeof createCounter>;
  } & T
>;

const ROUTE_NAME = "Home";
export const config = {
  name: ROUTE_NAME,
};

const metric = createCounter(getMetricKey(ROUTE_NAME));

export const home = new Elysia(config)
  .derive({ as: "scoped" }, () => ({
    metric,
  }))
  .use(routes);

home.get("/", sayHello);
home.post("/", sayHiPerson, {
  body: PersonSchema,
});
