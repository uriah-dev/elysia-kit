import { sendEmail } from "@src/emails";
import { logger } from "@src/lib/logger";
import { logMsg } from "@src/lib/utils";
import { task } from "@trigger.dev/sdk/v3";
import type { TriggerableTask } from "./queue";

export type SendEmailPayload = {
  to: string;
  subject: string;
  body: string;
  html: string;
  userId?: string;
};

export const sendEmailTask = task({
  id: "send-email",
  maxDuration: 60, // 1 minute max
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: SendEmailPayload) => {
    logger.info(
      logMsg("Sending email", { to: payload.to, subject: payload.subject })
    );

    await sendEmail(payload);

    logger.info(logMsg("Email sent successfully", { to: payload.to }));

    return {
      success: true,
      sentAt: new Date().toISOString(),
      to: payload.to,
    };
  },
}) as unknown as TriggerableTask<SendEmailPayload>;
