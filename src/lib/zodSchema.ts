import * as z from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    // 1️⃣ Length
    .min(4, { message: "Must be at least 4 characters" })
    .max(40, { message: "Must be at most 40 characters" }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(30, "Password must be at most 30 characters."),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      // 1️⃣ Length
      .min(4, { message: "Must be at least 4 characters" })
      .max(40, { message: "Must be at most 40 characters" })
      // 2️⃣ Allowed characters
      .refine((val) => /^[\p{L}\p{N}._]+$/u.test(val), {
        message: "Only letters, numbers, '.' and '_' are allowed.",
      })
      // 3️⃣ Cannot start with '.' or '_'
      .refine((val) => !/^[._]/.test(val), {
        message: "Username cannot start with '.' or '_'.",
      })
      // 4️⃣ Cannot end with '.' or '_'
      .refine((val) => !/[._]$/.test(val), {
        message: "Username cannot end with '.' or '_'.",
      })
      // 5️⃣ No consecutive '.' or '_'
      .refine((val) => !/[._]{2}/.test(val), {
        message: "Username cannot contain consecutive '.' or '_'.",
      })
      .refine(
        (val) => {
          const reserved = [
            "admin",
            "root",
            "support",
            "system",
            "moderator",
            "owner",
          ];
          return !reserved.includes(val.toLowerCase());
        },
        {
          message: "This username is reserved. Please choose another.",
        },
      ),
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters."),
    passwordConfirm: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters."),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: "custom",
        message: "match",
        path: ["confirmPassword"],
      });
    }
  });
