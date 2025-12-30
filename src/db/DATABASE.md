# Database Configuration Guide

This project uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL by default. This guide explains how to switch to other database clients.

## Current Configuration

| Component | Current Value |
|-----------|---------------|
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL |
| **Driver** | `postgres-js` |
| **Schema Location** | `src/db/schema/` |
| **Migrations** | `src/db/migrations/` |

## Quick Reference

| Database | Driver Package | Drizzle Import | Dialect |
|----------|---------------|----------------|---------|
| PostgreSQL | `postgres` | `drizzle-orm/postgres-js` | `postgresql` |
| MySQL | `mysql2` | `drizzle-orm/mysql2` | `mysql` |
| SQLite | `better-sqlite3` | `drizzle-orm/better-sqlite3` | `sqlite` |
| SQLite (Bun) | Built-in | `drizzle-orm/bun-sqlite` | `sqlite` |
| Turso/LibSQL | `@libsql/client` | `drizzle-orm/libsql` | `sqlite` |
| PlanetScale | `@planetscale/database` | `drizzle-orm/planetscale-serverless` | `mysql` |
| Neon | `@neondatabase/serverless` | `drizzle-orm/neon-serverless` | `postgresql` |

---

## Switching to MySQL

### Step 1: Install Dependencies

```bash
# Remove PostgreSQL driver
bun remove postgres

# Install MySQL driver
bun add mysql2
```

### Step 2: Update `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "@src/env";
import * as schema from "@db/schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let poolInstance: mysql.Pool | null = null;

const getDB = () => {
  if (!dbInstance) {
    if (!poolInstance) {
      poolInstance = mysql.createPool(env.DATABASE_URL);
    }
    dbInstance = drizzle(poolInstance, { schema, mode: "default" });
  }
  return dbInstance;
};

export const db = getDB();
export type DBType = typeof db;
```

### Step 3: Update `drizzle.config.ts`

```typescript
import { env } from "@src/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: `./src/db/schema/index.ts`,
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
```

### Step 4: Update Schema Files

Replace PostgreSQL-specific imports with MySQL equivalents:

```typescript
// Before (PostgreSQL)
import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// After (MySQL)
import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  // ... columns
});
```

### Step 5: Update `src/db/schema/helper.ts`

Update the helper to use MySQL types:

```typescript
import { varchar, timestamp } from "drizzle-orm/mysql-core";
import { createId, ID_CONFIG } from "@src/lib/common";

export const defaults = () => ({
  id: varchar("id", { length: ID_CONFIG.LENGTH })
    .primaryKey()
    .$defaultFn(() => createId()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

---

## Switching to SQLite (Bun Native)

Bun has built-in SQLite support, making this the simplest option.

### Step 1: Install Dependencies

```bash
# Remove PostgreSQL driver
bun remove postgres

# No additional packages needed - Bun has built-in SQLite!
```

### Step 2: Update `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "@db/schema";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

export type DBType = typeof db;
```

### Step 3: Update `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: `./src/db/schema/index.ts`,
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
});
```

### Step 4: Update Schema Files

```typescript
// Before (PostgreSQL)
import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// After (SQLite)
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

### Step 5: Update `.gitignore`

```gitignore
# SQLite database
*.db
*.db-journal
```

---

## Switching to Turso (LibSQL)

[Turso](https://turso.tech/) is a distributed SQLite database, great for edge deployments.

### Step 1: Install Dependencies

```bash
bun remove postgres
bun add @libsql/client
```

### Step 2: Update Environment Variables

```env
# .env
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your-auth-token
```

### Step 3: Update `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "@src/env";
import * as schema from "@db/schema";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export type DBType = typeof db;
```

### Step 4: Update `drizzle.config.ts`

```typescript
import { env } from "@src/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: `./src/db/schema/index.ts`,
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
});
```

---

## Switching to Neon (Serverless PostgreSQL)

[Neon](https://neon.tech/) is recommended for serverless PostgreSQL with connection pooling.

### Step 1: Install Dependencies

```bash
bun remove postgres
bun add @neondatabase/serverless
```

### Step 2: Update `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@src/env";
import * as schema from "@db/schema";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export type DBType = typeof db;
```

> **Note:** Schema files remain the same (PostgreSQL-compatible).

---

## Migration Checklist

After switching databases, complete these steps:

- [ ] Update `src/db/index.ts` with new driver
- [ ] Update `drizzle.config.ts` with new dialect
- [ ] Update all schema files in `src/db/schema/`
- [ ] Update `src/db/schema/helper.ts` with correct types
- [ ] Update `.env` with new `DATABASE_URL` format
- [ ] Remove old migrations: `rm -rf src/db/migrations/*`
- [ ] Generate new migrations: `bun run db:generate`
- [ ] Apply migrations: `bun run db:migrate`
- [ ] Test: `bun run dev`

---

## Type Mapping Reference

| PostgreSQL | MySQL | SQLite |
|------------|-------|--------|
| `varchar` | `varchar` | `text` |
| `text` | `text` | `text` |
| `integer` | `int` | `integer` |
| `serial` | `serial` | `integer` (autoincrement) |
| `timestamp` | `timestamp` | `integer` (mode: timestamp) |
| `boolean` | `boolean` | `integer` (0/1) |
| `json` | `json` | `text` (store as JSON string) |
| `uuid` | `varchar(36)` | `text` |

---

## Helpful Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit (Migrations)](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Driver](https://orm.drizzle.team/docs/get-started-postgresql)
- [MySQL Driver](https://orm.drizzle.team/docs/get-started-mysql)
- [SQLite Driver](https://orm.drizzle.team/docs/get-started-sqlite)
- [Turso/LibSQL Guide](https://orm.drizzle.team/docs/get-started-turso)
