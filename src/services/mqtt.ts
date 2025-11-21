// src/services/mqtt.ts
// Placeholder MQTT publisher. Replace with real broker integration later.
import type { Reading } from "../store/readings";

export async function mqttPublishReadings(readings: Reading[]): Promise<void> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));
  // In real impl, connect and publish to topic per patient
  // Throw to simulate occasional failure by random chance
  if (Math.random() < 0.05) {
    throw new Error("MQTT connection failed (simulated)");
  }
}


