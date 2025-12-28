import { Elysia } from "elysia";
import { logger } from "@src/lib/logger";
import { getRouteName } from "@src/lib/utils";

const deriveHandler = ({
  server,
  request,
}: Parameters<Parameters<Elysia["derive"]>[1]>[0]) => ({
  logger,
  startTime: Date.now(),
  ip: server?.requestIP(request),
});

const name = getRouteName();
export const routes = new Elysia({ name }).derive(
  { as: "global" },
  deriveHandler
);

export type Routes = typeof routes;
export type Context<T = {}> = ReturnType<typeof deriveHandler> & T;
