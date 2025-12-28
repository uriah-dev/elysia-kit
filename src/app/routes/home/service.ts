import { apiSuccess } from "@src/lib/common";
import type { PersonType } from "./schema";

export const sayHello = () => "Hello Elysia";

export const sayHiPerson = ({ body }: { body: PersonType }) => {
  return apiSuccess(body);
};
