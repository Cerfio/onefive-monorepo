import { Resend } from "resend";

let client: Resend | undefined;

export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');
  }
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}
