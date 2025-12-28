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
import { logMsg } from "@src/lib/utils";

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
      logger.info(logMsg("User created", { userId: user.id }));
      return apiSuccess(user, "User created successfully");
    },
    {
      errorMessage: "Failed to create user",
      onError: (error) => {
        logger.error(logMsg("Failed to create user", { error: error.message }));
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
        logger.warn(logMsg("User not found", { userId: params.id }));
        return apiError("NOT_FOUND", "User not found");
      }

      logger.info(logMsg("User retrieved", { userId: user.id }));
      return apiSuccess(user);
    },
    {
      errorMessage: "Failed to get user",
      onError: (error) => {
        logger.error(logMsg("Failed to get user", { error: error.message }));
        return null;
      },
    }
  );

export const listUsers = async ({ logger, metric, db }: UserContext) =>
  apiTryWrapper(
    async () => {
      addMetric(metric, { endpoint: "/", method: "GET" });
      const users = await findAll(db, usersTable);
      logger.info(logMsg("Users listed", { count: users.length }));
      return apiSuccess(users);
    },
    {
      errorMessage: "Failed to list users",
      onError: (error) => {
        logger.error(logMsg("Failed to list users", { error: error.message }));
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
        logger.warn(logMsg("User not found for update", { userId: params.id }));
        return apiError("NOT_FOUND", "User not found");
      }

      const updated = await updateById(db, usersTable, params.id, body);
      logger.info(logMsg("User updated", { userId: updated?.id }));
      return apiSuccess(updated, "User updated successfully");
    },
    {
      errorMessage: "Failed to update user",
      onError: (error) => {
        logger.error(logMsg("Failed to update user", { error: error.message }));
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
        logger.warn(
          logMsg("User not found for deletion", { userId: params.id })
        );
        return apiError("NOT_FOUND", "User not found");
      }

      await deleteById(db, usersTable, params.id);
      logger.info(logMsg("User deleted", { userId: params.id }));
      return apiSuccess({ id: params.id }, "User deleted successfully");
    },
    {
      errorMessage: "Failed to delete user",
      onError: (error) => {
        logger.error(logMsg("Failed to delete user", { error: error.message }));
        return null;
      },
    }
  );
