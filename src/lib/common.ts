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
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
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
): ErrorResponse =>
  ErrorResponseSchema.parse({
    success: false,
    error: {
      code,
      message,
      details: hasValue(details) ? details : undefined,
    },
  }) as ErrorResponse;

export const createId = init(ID_CONFIG);
