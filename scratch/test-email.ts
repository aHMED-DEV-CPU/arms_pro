import { z } from "zod";

const companySettingsValidationSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
});

try {
  const result = companySettingsValidationSchema.parse({ email: "INFO@SWAED.COM.SA" });
  console.log("Success parsing email:", result);
} catch (err: any) {
  console.error("Error parsing email:", err.errors || err);
}
