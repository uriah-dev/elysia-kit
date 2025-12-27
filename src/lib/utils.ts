import z from "zod";

export const hasValue = (value: unknown): value is string => {
  return value !== 0 && !!value;
};

export const getEnvValue = (key: string) => {
  const value = Bun.env[key];
  if (!hasValue(value)) {
    throw new ReferenceError(`${key}: Missing Env Variable`);
  }
  return value;
};

export const buildFromSchema = <T extends z.ZodObject<any>>(
  schema: T,
  getValue: (key: string) => string
): Record<string, string> => {
  return Object.keys(schema.shape).reduce((acc, key) => {
    acc[key] = getValue(key);
    return acc;
  }, {} as Record<string, string>);
};
