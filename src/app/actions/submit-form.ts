"use server";

import { Resend } from "resend";

type SubmitResult = { ok: boolean; error?: string };

export async function submitForm(formData: FormData): Promise<SubmitResult> {
  const formName = String(formData.get("__formName") || "Penni Form");
  const fields: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k === "__formName") continue;
    fields[k] = typeof v === "string" ? v : "[file]";
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FORM_TO_EMAIL;
  const from = process.env.FORM_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    // Forms still feel "submitted" during development; log payload server-side.
    console.log("[submitForm:dev]", formName, fields);
    return { ok: true };
  }

  const resend = new Resend(apiKey);
  const html = `
    <h2>${formName}</h2>
    <table style="border-collapse:collapse">
      ${Object.entries(fields)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px;border-bottom:1px solid #eee"><b>${k}</b></td><td style="padding:4px 12px;border-bottom:1px solid #eee">${v}</td></tr>`,
        )
        .join("")}
    </table>`;

  try {
    await resend.emails.send({
      from,
      to: [to],
      subject: `[Penni] ${formName}`,
      html,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}
