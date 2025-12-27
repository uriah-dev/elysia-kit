import { Elysia } from "elysia";
import { sayHello } from "./service";

export const home = new Elysia();

home.get("/", sayHello);
