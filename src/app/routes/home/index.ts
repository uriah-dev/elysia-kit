import { Elysia } from "elysia";
import { sayHello, sayHiPerson } from "./service";
import { PersonSchema } from "./schema";

export const home = new Elysia({ prefix: "home" });

home.get("/", sayHello);
home.post("/", sayHiPerson, {
  body: PersonSchema,
});
