#!/usr/bin/env bun
import { $ } from "bun";

type TryWrapperOptions = {
  onError?: (error: any) => void;
  exitOnError?: boolean;
};

const tryWrapper = async <T>(
  fn: () => Promise<T>,
  options?: TryWrapperOptions
): Promise<T | void> => {
  try {
    return await fn();
  } catch (error: any) {
    if (options?.onError) {
      options.onError(error);
    } else {
      // Handle Bun shell errors which have stderr/stdout
      const stderr = error.stderr?.toString?.()?.trim();
      const stdout = error.stdout?.toString?.()?.trim();
      const details = stderr || stdout || error.message;
      console.error(`❌ Error: ${details}`);
    }
    if (options?.exitOnError !== false) {
      process.exit(1);
    }
  }
};

const parseDbUrl = (url: string) => {
  const parsed = new URL(url);
  return {
    user: parsed.username || "postgres",
    password: parsed.password || "postgres",
    host: parsed.hostname || "localhost",
    port: parsed.port || "5432",
    database: parsed.pathname.slice(1) || "elysia_kit",
  };
};

const DATABASE_URL =
  Bun.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/elysia_kit";
const dbConfig = parseDbUrl(DATABASE_URL);

const CONTAINER_NAME = Bun.env.DB_CONTAINER_NAME || "elysia-kit-db";
const DB_PORT = dbConfig.port;
const DB_USER = dbConfig.user;
const DB_PASSWORD = dbConfig.password;
const DB_NAME = dbConfig.database;
const POSTGRES_VERSION = Bun.env.POSTGRES_VERSION || "16";

const action = process.argv[2] || "up";

const commands = {
  up: async () => {
    console.log(`🐘 Starting PostgreSQL ${POSTGRES_VERSION}...`);

    // Check if container exists
    const containers = await $`docker ps -a --format '{{.Names}}'`.text();
    const exists = containers.split("\n").includes(CONTAINER_NAME);

    if (exists) {
      // Container exists, start it
      console.log(`📦 Container ${CONTAINER_NAME} exists, starting...`);
      await $`docker start ${CONTAINER_NAME}`;
    } else {
      // Create new container
      console.log(`📦 Creating new container ${CONTAINER_NAME}...`);
      await $`docker run -d \
        --name ${CONTAINER_NAME} \
        -e POSTGRES_USER=${DB_USER} \
        -e POSTGRES_PASSWORD=${DB_PASSWORD} \
        -e POSTGRES_DB=${DB_NAME} \
        -p ${DB_PORT}:5432 \
        postgres:${POSTGRES_VERSION}`;
    }

    console.log(`✅ PostgreSQL running on port ${DB_PORT}`);
    console.log(
      `📝 Connection URL: postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}`
    );
  },

  down: async () => {
    console.log(`🛑 Stopping PostgreSQL...`);
    await $`docker stop ${CONTAINER_NAME}`.quiet();
    console.log(`✅ PostgreSQL stopped`);
  },

  destroy: async () => {
    console.log(`🗑️  Destroying PostgreSQL container...`);
    await $`docker stop ${CONTAINER_NAME}`.quiet();
    await $`docker rm ${CONTAINER_NAME}`.quiet();
    console.log(`✅ PostgreSQL container destroyed`);
  },

  logs: async () => {
    await $`docker logs -f ${CONTAINER_NAME}`;
  },

  status: async () => {
    const result =
      await $`docker ps --filter name=${CONTAINER_NAME} --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`.text();
    if (result.trim()) {
      console.log(result);
    } else {
      console.log(`❌ Container ${CONTAINER_NAME} is not running`);
    }
  },

  shell: async () => {
    console.log(`🐚 Opening psql shell...`);
    await $`docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}`;
  },
};

const command = commands[action as keyof typeof commands];

if (!command) {
  console.log(`
📖 Usage: bun run scripts/dev-db.ts [command]

Commands:
  up       Start the PostgreSQL container (default)
  down     Stop the PostgreSQL container
  destroy  Stop and remove the container
  logs     Show container logs
  status   Show container status
  shell    Open psql shell

Environment variables:
  DATABASE_URL       PostgreSQL connection URL (default: postgresql://postgres:postgres@localhost:5432/elysia_kit)
  DB_CONTAINER_NAME  Container name (default: elysia-kit-db)
  POSTGRES_VERSION   PostgreSQL version (default: 16)
`);
  process.exit(1);
}

(async () => {
  await tryWrapper(command);
})();
