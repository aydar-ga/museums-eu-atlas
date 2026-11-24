/** Resend delivery. Every call has a timeout, so a slow provider cannot hold a request open. */
export async function sendEmail(
  delivery: { apiKey: string; from: string },
  message: { to: string; subject: string; text: string; html?: string },
  timeoutMs = 5000
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${delivery.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: delivery.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {})
    }),
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!response.ok) {
    throw new Error("Email provider rejected the message.");
  }
}
