import z from "zod";

export const PersonSchema = z.object({
  name: z.string().min(1),
});
export type PersonType = z.infer<typeof PersonSchema>;
