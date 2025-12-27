import { server } from "@app/_app";
import { env } from "@src/env";

server.listen(env.APP_PORT);

console.log(
  `🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`
);

export type Server = typeof server;
