// src/services/sqlite.ts
import * as SQLite from "expo-sqlite";
import type { Reading } from "../store/readings";

export const db = SQLite.openDatabaseSync?.("carelink.db") ?? (SQLite as any).openDatabase("carelink.db");

export async function ensureSchema(): Promise<void> {
  await db.execAsync?.("PRAGMA journal_mode = WAL;");
  await db.execAsync?.(
    `CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      heartRate INTEGER,
      systolic INTEGER,
      diastolic INTEGER,
      spo2 INTEGER,
      classification TEXT,
      probability REAL,
      importance TEXT,
      createdAt INTEGER
    );`
  );
}

export async function insertReading(r: Reading): Promise<void> {
  const importanceJson = JSON.stringify(r.classification.featureImportance ?? {});
  await db.runAsync?.(
    `INSERT INTO readings (heartRate, systolic, diastolic, spo2, classification, probability, importance, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [r.heartRate, r.systolic, r.diastolic, r.spo2, r.classification.label, r.classification.probability, importanceJson, r.createdAt]
  );
}

export async function getAllReadings(): Promise<Reading[]> {
  const rows = await db.getAllAsync?.(
    `SELECT id, heartRate, systolic, diastolic, spo2, classification, probability, importance, createdAt FROM readings ORDER BY createdAt DESC;`
  );
  return (rows ?? []).map((row: any) => ({
    id: row.id,
    heartRate: row.heartRate,
    systolic: row.systolic,
    diastolic: row.diastolic,
    spo2: row.spo2,
    classification: { label: row.classification, probability: row.probability, featureImportance: JSON.parse(row.importance || "{}") },
    createdAt: row.createdAt,
  }));
}

export async function clearAllReadings(): Promise<void> {
  await db.execAsync?.("DELETE FROM readings;");
}

export async function bytesQueued(): Promise<number> {
  const rows = await getAllReadings();
  const json = JSON.stringify(rows);
  return new Blob([json]).size;
}


