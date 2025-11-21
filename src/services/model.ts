// src/services/model.ts
// Placeholder model: simple heuristic with mock probability and feature importance
import type { Classification } from "../store/readings";

export async function classifyReading(input: {
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
}): Promise<Classification> {
  // Heuristic: critical if SpO2 < 92 or systolic > 180 or HR > 130
  const criticalSignals = [
    input.spo2 < 92 ? 1 : 0,
    input.systolic > 180 ? 1 : 0,
    input.heartRate > 130 ? 1 : 0,
  ];
  const score = criticalSignals.reduce((a, b) => a + b, 0);
  const label = score >= 1 ? "critical" : "non-critical";
  const probability = label === "critical" ? Math.min(0.6 + 0.2 * score, 0.95) : 0.9;
  const featureImportance = {
    spo2: input.spo2 < 92 ? 0.5 : 0.1,
    systolic: input.systolic > 180 ? 0.3 : 0.1,
    heartRate: input.heartRate > 130 ? 0.2 : 0.1,
    diastolic: 0.1,
  };
  return { label, probability, featureImportance };
}


