import { sendEmail } from "@src/emails";
import { logger } from "@src/lib/logger";
import { hasValue, logMsg, tryWrapper } from "@src/lib/utils";
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

    const result = await tryWrapper(async () => await sendEmail(payload));

    if (!hasValue(result) || !result.success) {
      const errorMessage = result?.error || "Failed to send email";
      logger.error(
        logMsg("Failed to send email", {
          to: payload.to,
          error: errorMessage,
        })
      );
      throw new Error(errorMessage);
    }

    logger.info(
      logMsg("Email sent successfully", {
        to: payload.to,
        emailId: result.id,
      })
    );

    return {
      success: result.success,
      sentAt: new Date().toISOString(),
      to: payload.to,
      emailId: result.id,
    };
  },
}) as unknown as TriggerableTask<SendEmailPayload>;
