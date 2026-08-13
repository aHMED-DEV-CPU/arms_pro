import { contactFormSchema } from "@/lib/contact";

const recipientEmail = "INFO@SWAED.COM.SA";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const normalizedPayload =
    payload && typeof payload === "object"
      ? {
          name: "name" in payload ? payload.name : "",
          email: "email" in payload ? payload.email : "",
          phone: "phone" in payload ? payload.phone : "",
          subject: "subject" in payload ? payload.subject : "",
          message: "message" in payload ? payload.message : "",
        }
      : payload;
  const result = contactFormSchema.safeParse(normalizedPayload);

  if (!result.success) {
    return Response.json(
      {
        message: "Please correct the highlighted fields.",
        issues: result.error.issues,
      },
      { status: 400 },
    );
  }

  return Response.json(
    {
      message: `Email delivery is not configured yet. This enquiry is intended for ${recipientEmail}; connect an SMTP or email API provider before enabling live delivery.`,
    },
    { status: 501 },
  );
}
