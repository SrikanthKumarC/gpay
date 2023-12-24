import { z } from "zod";

const phoneNumberSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(10, { message: `${fieldName} must be 10 digits` })
    .max(10, { message: `${fieldName} must be 10 digits` })
    .refine((value) => /^\d+$/.test(value), {
      message: `${fieldName} must contain only numeric characters`,
    });

const phoneNumberValidator = z
.string()
.trim()
.min(10, { message: `Phone number must be 10 digits` })
.max(10, { message: `Phone number must be 10 digits` })
.refine((value) => /^\d+$/.test(value), {
  message: `Phone number must contain only numeric characters`,
});

const createUserSchema = z.object({
  phoneNumber: phoneNumberSchema("Phone number"),
  availableCash: z.number().min(0, { message: "Amount cannot be negative" }),
});

const transferMoneySchema = z.object({
  from: phoneNumberSchema("Sender phone number"),
  to: phoneNumberSchema("Receiver phone number"),
  amount: z.number().min(0, { message: "Amount cannot be negative" }),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type TransferMoneySchemaType = z.infer<typeof transferMoneySchema>;

export default { createUserSchema, transferMoneySchema, phoneNumberValidator };
