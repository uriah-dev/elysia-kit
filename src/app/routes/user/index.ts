import { Elysia } from "elysia";
import { createCounter } from "@lib/telemetry";
import { getRoutePrefix, getMetricKey } from "@src/lib/utils";
import { type Context, routes } from "@routes/index";
import {
  createUser,
  getUser,
  listUsers,
  updateUser,
  deleteUser,
  testMail,
} from "./service";
import { UsersInsertSchema, UsersUpdateSchema } from "@db/schema/users";

export type UserContext<T = {}> = Context<
  {
    metric: ReturnType<typeof createCounter>;
  } & T
>;

const ROUTE_NAME = "User";
export const config = {
  name: ROUTE_NAME,
  prefix: getRoutePrefix(ROUTE_NAME),
};

const metric = createCounter(getMetricKey(ROUTE_NAME));

export const user = new Elysia(config)
  .derive({ as: "scoped" }, () => ({
    metric,
  }))
  .use(routes)
  .get("/", listUsers)
  .get("/:id", getUser)
  .post("/", createUser, {
    body: UsersInsertSchema,
  })
  .put("/:id", updateUser, {
    body: UsersUpdateSchema,
  })
  .delete("/:id", deleteUser)
  .post("/email", testMail, {
    body: UsersInsertSchema.pick({ email: true }),
  });
