import z from "zod";

const getEnv = () => (typeof Bun !== "undefined" ? Bun.env : process.env);

export const hasValue = (value: unknown): value is string => {
  return value !== 0 && !!value;
};

const isOptionalField = (field: z.ZodTypeAny): boolean => {
  if (typeof (field as any).isOptional === "function") {
    return (field as any).isOptional();
  }
  const typeName = (field._def as any)?.typeName as string | undefined;
  if (
    typeName === "ZodOptional" ||
    typeName === "ZodDefault" ||
    typeName === "ZodNullable"
  ) {
    return true;
  }
  if (typeName === "ZodEffects" && (field._def as any)?.schema) {
    return isOptionalField((field._def as any).schema);
  }
  const zodType = (field as any)._zod?.def?.type;
  if (zodType === "optional" || zodType === "default" || zodType === "nullable") {
    return true;
  }

  return false;
};

export const getEnvValue = <T extends z.ZodObject<any>>(schema: T) => {
  return (key: string): string | undefined => {
    const value = getEnv()[key];
    const field = schema.shape[key];

    if (!field) return value;
    if (isOptionalField(field) && !hasValue(value)) {
      return undefined;
    }
    if (!hasValue(value)) {
      throw new ReferenceError(`${key}: Missing Env Variable`);
    }
    return value;
  };
};

export const buildFromSchema = <T extends z.ZodObject<any>>(
  schema: T,
  getValue: (key: string) => string | undefined
): Record<string, string | undefined> => {
  return Object.keys(schema.shape).reduce((acc, key) => {
    acc[key] = getValue(key);
    return acc;
  }, {} as Record<string, string | undefined>);
};
