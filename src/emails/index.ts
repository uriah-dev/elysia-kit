import { env } from "@src/env";
import { Resend } from "resend";
import { logger } from "@src/lib/logger";
import { hasValue, tryWrapper } from "@src/lib/utils";

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
  headers?: Record<string, string>;
};

export type SendEmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

const resend = new Resend(env.RESEND_API_KEY);

const buildEmailOptions = (params: SendEmailParams) => {
  const emailOptions: any = {
    from: params.from || env.RESEND_MAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  };

  if (params.text) {
    emailOptions.text = params.text;
  }
  if (params.replyTo) {
    emailOptions.replyTo = params.replyTo;
  }
  if (params.cc) {
    emailOptions.cc = params.cc;
  }
  if (params.bcc) {
    emailOptions.bcc = params.bcc;
  }
  if (params.tags) {
    emailOptions.tags = params.tags;
  }
  if (params.headers) {
    emailOptions.headers = params.headers;
  }

  return emailOptions;
};

export const sendEmail = async (
  params: SendEmailParams
): Promise<SendEmailResult> => {
  const res = await tryWrapper(async () => {
    const emailOptions = buildEmailOptions(params);
    const { data, error } = await resend.emails.send(emailOptions);

    if (!hasValue(data) && hasValue(error)) {
      logger.error({ error, to: params.to }, "Failed to send email");
      return {
        success: false,
        error: error?.message || "Unknown error",
      };
    }

    logger.info(
      { emailId: data?.id, to: params.to },
      "Email sent successfully"
    );

    return {
      success: true,
      id: data?.id,
    };
  });
  if (res?.success) {
    return res;
  }
  logger.error({ to: params.to }, "An error occurred sending mail");
  return {
    success: false,
    error: res?.error || "Unknown error",
  };
};
