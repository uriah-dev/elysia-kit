import { eq, type SQL } from "drizzle-orm";
import type { PgTable, PgColumn } from "drizzle-orm/pg-core";
import type { DBType } from "./index";

type InferInsert<T extends PgTable> = T["$inferInsert"];
type InferSelect<T extends PgTable> = T["$inferSelect"];

export const findById = async <T extends PgTable>(
  db: DBType,
  table: T,
  id: string,
  idColumn: PgColumn = (table as any).id
): Promise<InferSelect<T> | undefined> => {
  const [result] = await (db as any)
    .select()
    .from(table)
    .where(eq(idColumn, id))
    .limit(1);
  return result as InferSelect<T> | undefined;
};

export const findOne = async <T extends PgTable>(
  db: DBType,
  table: T,
  where: SQL
): Promise<InferSelect<T> | undefined> => {
  const [result] = await (db as any).select().from(table).where(where).limit(1);
  return result as InferSelect<T> | undefined;
};

export const findMany = async <T extends PgTable>(
  db: DBType,
  table: T,
  options?: {
    where?: SQL;
    limit?: number;
    offset?: number;
  }
): Promise<InferSelect<T>[]> => {
  let query = (db as any).select().from(table);

  if (options?.where) {
    query = query.where(options.where);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.offset(options.offset);
  }

  return (await query) as InferSelect<T>[];
};

export const findAll = async <T extends PgTable>(
  db: DBType,
  table: T
): Promise<InferSelect<T>[]> => {
  return (await (db as any).select().from(table)) as InferSelect<T>[];
};

export const insertOne = async <T extends PgTable>(
  db: DBType,
  table: T,
  data: InferInsert<T>
): Promise<InferSelect<T>> => {
  const [result] = await (db as any).insert(table).values(data).returning();
  return result as InferSelect<T>;
};

export const insertMany = async <T extends PgTable>(
  db: DBType,
  table: T,
  data: InferInsert<T>[]
): Promise<InferSelect<T>[]> => {
  const results = await (db as any).insert(table).values(data).returning();
  return results as InferSelect<T>[];
};

export const updateById = async <T extends PgTable>(
  db: DBType,
  table: T,
  id: string,
  data: Partial<InferInsert<T>>,
  idColumn: PgColumn = (table as any).id
): Promise<InferSelect<T> | undefined> => {
  const [result] = await (db as any)
    .update(table)
    .set(data)
    .where(eq(idColumn, id))
    .returning();
  return result as InferSelect<T> | undefined;
};

export const updateWhere = async <T extends PgTable>(
  db: DBType,
  table: T,
  where: SQL,
  data: Partial<InferInsert<T>>
): Promise<InferSelect<T>[]> => {
  const results = await (db as any)
    .update(table)
    .set(data)
    .where(where)
    .returning();
  return results as InferSelect<T>[];
};

export const deleteById = async <T extends PgTable>(
  db: DBType,
  table: T,
  id: string,
  idColumn: PgColumn = (table as any).id
): Promise<InferSelect<T> | undefined> => {
  const [result] = await (db as any)
    .delete(table)
    .where(eq(idColumn, id))
    .returning();
  return result as InferSelect<T> | undefined;
};

export const deleteWhere = async <T extends PgTable>(
  db: DBType,
  table: T,
  where: SQL
): Promise<InferSelect<T>[]> => {
  const results = await (db as any).delete(table).where(where).returning();
  return results as InferSelect<T>[];
};

export const count = async <T extends PgTable>(
  db: DBType,
  table: T,
  where?: SQL
): Promise<number> => {
  let query = (db as any).select().from(table);
  if (where) {
    query = query.where(where);
  }
  const results = await query;
  return results.length;
};

export const exists = async <T extends PgTable>(
  db: DBType,
  table: T,
  where: SQL
): Promise<boolean> => {
  const result = await findOne(db, table, where);
  return result !== undefined;
};
