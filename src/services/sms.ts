// src/services/sms.ts
// Placeholder SMS fallback. Replace with integration (e.g., Twilio) via server relay.
import type { Reading } from "../store/readings";

export async function sendSmsFallback(readings: Reading[]): Promise<void> {
  // Simulate immediate success; in real life this would hit a local SMS API or OS intent
  await new Promise((r) => setTimeout(r, 100));
}


