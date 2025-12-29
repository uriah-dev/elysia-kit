import { sendEmail } from "@src/emails";
import { logger } from "@src/lib/logger";
import { hasValue, tryWrapper } from "@src/lib/utils";
import { task } from "@trigger.dev/sdk/v3";
import type { TriggerableTask } from "./queue";

export type SendEmailPayload = {
  to: string;
  subject: string;
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
    logger.info({ to: payload.to, subject: payload.subject }, "Sending email");

    const result = await tryWrapper(async () => await sendEmail(payload));

    if (!hasValue(result) || !result.success) {
      const errorMessage = result?.error || "Failed to send email";
      logger.error(
        {
          to: payload.to,
          error: errorMessage,
        },
        "Failed to send email"
      );
      throw new Error(errorMessage);
    }

    logger.info(
      {
        to: payload.to,
        emailId: result.id,
      },
      "Email sent successfully"
    );

    return {
      success: result.success,
      sentAt: new Date().toISOString(),
      to: payload.to,
      emailId: result.id,
    };
  },
}) as unknown as TriggerableTask<SendEmailPayload>;
