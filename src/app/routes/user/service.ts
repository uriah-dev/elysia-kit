import { usersTable } from "@db/schema/users";
import {
  findById,
  findAll,
  insertOne,
  updateById,
  deleteById,
} from "@db/helper";
import { apiSuccess, apiError, apiTryWrapper } from "@src/lib/common";
import { addMetric } from "@lib/telemetry";
import type { UserContext } from ".";
import type { UserInsert, UserUpdate } from "@db/schema/users";
import { WelcomeEmail } from "@src/emails/welcome";
import { render } from "@react-email/render";

export const createUser = async ({
  body,
  logger,
  metric,
  db,
}: UserContext<{ body: UserInsert }>) =>
  apiTryWrapper(
    async () => {
      const user = await insertOne(db, usersTable, body);
      addMetric(metric, { endpoint: "/", method: "POST" });
      logger.info({ userId: user.id }, "User created");
      return apiSuccess(user, "User created successfully");
    },
    {
      errorMessage: "Failed to create user",
      onError: (error) => {
        logger.error({ error: error.message }, "Failed to create user");
        if (error.code === "23505") {
          return apiError("VALIDATION_ERROR", "Email already exists");
        }
        return null;
      },
    }
  );

export const getUser = async ({
  params,
  logger,
  metric,
  db,
}: UserContext<{ params: { id: string } }>) =>
  apiTryWrapper(
    async () => {
      addMetric(metric, { endpoint: "/:id", method: "GET" });
      const user = await findById(db, usersTable, params.id);

      if (!user) {
        logger.warn({ userId: params.id }, "User not found");
        return apiError("NOT_FOUND", "User not found");
      }

      logger.info({ userId: user.id }, "User retrieved");
      return apiSuccess(user);
    },
    {
      errorMessage: "Failed to get user",
      onError: (error) => {
        logger.error({ error: error.message }, "Failed to get user");
        return null;
      },
    }
  );

export const listUsers = async ({ logger, metric, db }: UserContext) =>
  apiTryWrapper(
    async () => {
      addMetric(metric, { endpoint: "/", method: "GET" });
      const users = await findAll(db, usersTable);
      logger.info({ count: users.length }, "Users listed");
      return apiSuccess(users);
    },
    {
      errorMessage: "Failed to list users",
      onError: (error) => {
        logger.error({ error: error.message }, "Failed to list users");
        return null;
      },
    }
  );

export const updateUser = async ({
  params,
  body,
  logger,
  metric,
  db,
}: UserContext<{ params: { id: string }; body: UserUpdate }>) =>
  apiTryWrapper(
    async () => {
      addMetric(metric, { endpoint: "/:id", method: "PUT" });

      const existing = await findById(db, usersTable, params.id);
      if (!existing) {
        logger.warn({ userId: params.id }, "User not found for update");
        return apiError("NOT_FOUND", "User not found");
      }

      const updated = await updateById(db, usersTable, params.id, body);
      logger.info({ userId: updated?.id }, "User updated");
      return apiSuccess(updated, "User updated successfully");
    },
    {
      errorMessage: "Failed to update user",
      onError: (error) => {
        logger.error({ error: error.message }, "Failed to update user");
        if (error.code === "23505") {
          return apiError("VALIDATION_ERROR", "Email already exists");
        }
        return null;
      },
    }
  );

export const deleteUser = async ({
  params,
  logger,
  metric,
  db,
}: UserContext<{ params: { id: string } }>) =>
  apiTryWrapper(
    async () => {
      addMetric(metric, { endpoint: "/:id", method: "DELETE" });

      const existing = await findById(db, usersTable, params.id);
      if (!existing) {
        logger.warn({ userId: params.id }, "User not found for deletion");
        return apiError("NOT_FOUND", "User not found");
      }

      await deleteById(db, usersTable, params.id);
      logger.info({ userId: params.id }, "User deleted");
      return apiSuccess({ id: params.id }, "User deleted successfully");
    },
    {
      errorMessage: "Failed to delete user",
      onError: (error) => {
        logger.error({ error: error.message }, "Failed to delete user");
        return null;
      },
    }
  );

export const testMail = async ({
  queue,
  body,
  logger,
  metric,
}: UserContext<{ body: Pick<UserInsert, "email"> }>) =>
  apiTryWrapper(
    async () => {
      addMetric(metric, { endpoint: "/email", method: "POST" });
      logger.info({ email: body.email }, "Queuing email notification");

      const to = body.email;
      const html = await render(WelcomeEmail({}));

      const job = await queue.email.enqueue({
        to,
        subject: "Welcome To Elysia Kit",
        html,
      });

      logger.info({ jobId: job.id, email: to }, "Email queued");
      return apiSuccess({ email: to }, "Email queued successfully");
    },
    {
      errorMessage: "Failed to queue email",
      onError: (error) => {
        logger.error({ error: error.message }, "Failed to queue email");
        return null;
      },
    }
  );
