// src/store/readings.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db, ensureSchema, insertReading, getAllReadings, bytesQueued, clearAllReadings } from "../services/sqlite";
import { mqttPublishReadings } from "../services/mqtt";
import { sendSmsFallback } from "../services/sms";

export interface Classification {
  label: "critical" | "non-critical";
  probability: number;
  featureImportance?: Record<string, number>;
}

export interface Reading {
  id?: number;
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  classification: Classification;
  createdAt: number;
}

interface ReadingsState {
  allReadings: Reading[];
  latestReading: Reading | null;
  pendingBytes: number;
  lastSyncAt: number | null;
  loadReadings: () => Promise<void>;
  addReadingAndMaybeSync: (r: Omit<Reading, "id" | "createdAt">) => Promise<void>;
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const THREE_MB = 3 * 1024 * 1024;

export const useReadingsStore = create<ReadingsState>()(
  persist(
    (set, get) => ({
      allReadings: [],
      latestReading: null,
      pendingBytes: 0,
      lastSyncAt: null,
      loadReadings: async () => {
        await ensureSchema();
        const rows = await getAllReadings();
        set({ allReadings: rows, latestReading: rows[0] ?? null, pendingBytes: await bytesQueued() });
      },
      addReadingAndMaybeSync: async (incoming) => {
        await ensureSchema();
        const withTimestamp: Reading = { ...incoming, createdAt: Date.now() };

        // If critical: send immediately with all stored readings and importance
        const isCritical = incoming.classification.label === "critical";
        if (isCritical) {
          const backlog = await getAllReadings();
          const payload = [withTimestamp, ...backlog].sort((a, b) => a.createdAt - b.createdAt);
          try {
            await mqttPublishReadings(payload);
            await clearAllReadings();
            set({ lastSyncAt: Date.now(), pendingBytes: await bytesQueued() });
          } catch (e) {
            await sendSmsFallback(payload);
          }
          set({ latestReading: withTimestamp });
          return;
        }

        // Non-critical: store locally, sync on thresholds
        await insertReading(withTimestamp);
        const pending = await bytesQueued();
        set({ latestReading: withTimestamp, pendingBytes: pending });

        const since = get().lastSyncAt ?? 0;
        const timeExceeded = Date.now() - since >= TWO_HOURS_MS;
        const sizeExceeded = pending >= THREE_MB;
        if (timeExceeded || sizeExceeded) {
          const rows = await getAllReadings();
          try {
            await mqttPublishReadings(rows);
            await clearAllReadings();
            set({ lastSyncAt: Date.now(), pendingBytes: await bytesQueued() });
          } catch (e) {
            await sendSmsFallback(rows);
          }
        }
      },
    }),
    { name: "carelink-readings" }
  )
);


