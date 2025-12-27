import { app } from "./app/_app";
import { env } from "./env";

app.get("/", () => "Hello Elysia").listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
