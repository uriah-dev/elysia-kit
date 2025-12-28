import { Elysia } from "elysia";
import { home } from "./home";

export const routes = new Elysia().use(home);
