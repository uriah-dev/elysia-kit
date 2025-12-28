import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@src/env";
import * as schema from "@db/schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let clientInstance: ReturnType<typeof postgres> | null = null;

const getDB = () => {
  if (!dbInstance) {
    if (!clientInstance) {
      clientInstance = postgres(env.DATABASE_URL);
    }
    dbInstance = drizzle(clientInstance, { schema });
  }
  return dbInstance;
};

export const db = getDB();

export type DbType = typeof db;
