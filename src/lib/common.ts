import { z } from "zod";
import { hasValue } from "./utils";
import { init } from "@paralleldrive/cuid2";
import { ID_CONFIG } from "@src/db/schema/helper";

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
} as const;

export const ErrorStatusCodes: Record<ErrorCodesType, number> = {
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_ERROR: 500,
  BAD_REQUEST: 400,
};

export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type SuccessResponse<T> = z.infer<
  ReturnType<typeof SuccessResponseSchema<z.ZodType<T>>>
>;
export type ErrorResponseBody = z.infer<typeof ErrorResponseSchema>;
export type ErrorResponse = Response;
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
export type ErrorCodesType = keyof typeof ErrorCodes;

export const apiSuccess = <T>(data: T, message?: string): SuccessResponse<T> =>
  SuccessResponseSchema(z.any()).parse({
    success: true,
    data,
    message: hasValue(message) ? message : undefined,
  }) as SuccessResponse<T>;

export const apiError = (
  code: ErrorCodesType,
  message: string,
  details?: unknown
): Response => {
  const status = ErrorStatusCodes[code];
  const body: ErrorResponseBody = {
    success: false,
    error: {
      code,
      message,
      details: hasValue(details) ? details : undefined,
    },
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

type APITryWrapperOptions = {
  errorCode?: ErrorCodesType;
  errorMessage?: string;
  onError?: (error: any) => ErrorResponse | null;
};

type APITryWrapperResult<T> = Promise<SuccessResponse<T> | ErrorResponse>;

export const apiTryWrapper = async <T>(
  fn: () => Promise<T | SuccessResponse<T> | ErrorResponse>,
  options?: APITryWrapperOptions
): APITryWrapperResult<T> => {
  try {
    const result = await fn();

    if (hasValue(result)) {
      return result as SuccessResponse<T> | ErrorResponse;
    }

    return apiSuccess(result as T);
  } catch (error: any) {
    if (options?.onError) {
      const customResponse = options.onError(error);
      if (customResponse) return customResponse;
    }
    return apiError(
      options?.errorCode || "INTERNAL_ERROR",
      options?.errorMessage || error.message || "An error occurred",
      error.message
    );
  }
};

export const createId = init(ID_CONFIG);
