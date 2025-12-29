import { runs } from "@trigger.dev/sdk/v3";
import { logger } from "@lib/logger";

export type QueueOptions = {
  delay?: string | Date; // ISO duration string (e.g., "1h", "30m") or Date
  idempotencyKey?: string; // Prevent duplicate jobs
  ttl?: string; // Time to live for the job
  tags?: string[]; // Tags for filtering/searching
};

export type JobHandle = {
  id: string;
  taskId: string;
  status: "QUEUED" | "EXECUTING" | "COMPLETED" | "FAILED";
};

export type BatchItem<T> = {
  payload: T;
  options?: QueueOptions;
};

export type TriggerableTask<TPayload = any> = {
  id: string;
  trigger: (payload: TPayload, options?: any) => Promise<{ id: string }>;
  triggerAndWait: (payload: TPayload, options?: any) => Promise<any>;
  batchTrigger: (
    items: { payload: TPayload; options?: any }[]
  ) => Promise<
    { batchId: string; runs: { id: string }[] } | { runs: { id: string }[] }
  >;
};

export const queue = {
  async enqueue<TPayload>(
    task: TriggerableTask<TPayload>,
    payload: TPayload,
    options?: QueueOptions
  ): Promise<JobHandle> {
    try {
      const handle = await task.trigger(payload, {
        delay: options?.delay,
        idempotencyKey: options?.idempotencyKey,
        ttl: options?.ttl,
        tags: options?.tags,
      });

      logger.info({ jobId: handle.id, taskId: task.id }, "Job enqueued");

      return {
        id: handle.id,
        taskId: task.id,
        status: "QUEUED",
      };
    } catch (error: any) {
      logger.error(
        { taskId: task.id, error: error.message },
        "Failed to enqueue job"
      );
      throw error;
    }
  },

  async enqueueAndWait<TPayload, TResult = any>(
    task: TriggerableTask<TPayload>,
    payload: TPayload,
    options?: Omit<QueueOptions, "delay">
  ): Promise<TResult> {
    try {
      logger.info({ taskId: task.id }, "Job enqueued, waiting for completion");

      const result = await task.triggerAndWait(payload, {
        idempotencyKey: options?.idempotencyKey,
        tags: options?.tags,
      });

      logger.info({ jobId: result.id, taskId: task.id }, "Job completed");

      return result as TResult;
    } catch (error: any) {
      logger.error({ taskId: task.id, error: error.message }, "Job failed");
      throw error;
    }
  },

  async enqueueBatch<TPayload>(
    task: TriggerableTask<TPayload>,
    items: BatchItem<TPayload>[]
  ): Promise<JobHandle[]> {
    try {
      const batchItems = items.map((item) => ({
        payload: item.payload,
        options: {
          delay: item.options?.delay,
          idempotencyKey: item.options?.idempotencyKey,
          ttl: item.options?.ttl,
          tags: item.options?.tags,
        },
      }));

      const handle = await task.batchTrigger(batchItems);

      logger.info(
        { taskId: task.id, count: items.length },
        "Batch jobs enqueued"
      );

      const runs = (handle as any).runs || [];

      return runs.map((run: { id: string }) => ({
        id: run.id,
        taskId: task.id,
        status: "QUEUED" as const,
      }));
    } catch (error: any) {
      logger.error(
        { taskId: task.id, error: error.message },
        "Failed to enqueue batch"
      );
      throw error;
    }
  },

  async schedule<TPayload>(
    task: TriggerableTask<TPayload>,
    payload: TPayload,
    runAt: Date,
    options?: Omit<QueueOptions, "delay">
  ): Promise<JobHandle> {
    return this.enqueue(task, payload, {
      ...options,
      delay: runAt,
    });
  },

  async getStatus(runId: string): Promise<JobHandle | null> {
    try {
      const run = await runs.retrieve(runId);

      if (!run) return null;

      const statusMap: Record<string, JobHandle["status"]> = {
        PENDING: "QUEUED",
        QUEUED: "QUEUED",
        EXECUTING: "EXECUTING",
        COMPLETED: "COMPLETED",
        FAILED: "FAILED",
        CANCELED: "FAILED",
        SYSTEM_FAILURE: "FAILED",
      };

      return {
        id: run.id,
        taskId: (run as any).taskIdentifier || "unknown",
        status: statusMap[run.status] || "QUEUED",
      };
    } catch (error: any) {
      logger.error({ runId, error: error.message }, "Failed to get job status");
      return null;
    }
  },

  async cancel(runId: string): Promise<boolean> {
    try {
      await runs.cancel(runId);
      logger.info({ runId }, "Job cancelled");
      return true;
    } catch (error: any) {
      logger.error({ runId, error: error.message }, "Failed to cancel job");
      return false;
    }
  },

  async replay(runId: string): Promise<JobHandle | null> {
    try {
      const result = await runs.replay(runId);
      logger.info({ runId, newRunId: result.id }, "Job replayed");

      return {
        id: result.id,
        taskId: "replayed",
        status: "QUEUED",
      };
    } catch (error: any) {
      logger.error({ runId, error: error.message }, "Failed to replay job");
      return null;
    }
  },
};

export const createQueue = <TPayload>(task: TriggerableTask<TPayload>) => ({
  enqueue: (payload: TPayload, options?: QueueOptions) =>
    queue.enqueue(task, payload, options),

  enqueueAndWait: <TResult = any>(
    payload: TPayload,
    options?: Omit<QueueOptions, "delay">
  ) => queue.enqueueAndWait<TPayload, TResult>(task, payload, options),

  enqueueBatch: (items: BatchItem<TPayload>[]) =>
    queue.enqueueBatch(task, items),

  schedule: (
    payload: TPayload,
    runAt: Date,
    options?: Omit<QueueOptions, "delay">
  ) => queue.schedule(task, payload, runAt, options),
});
