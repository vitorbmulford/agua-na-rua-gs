import * as SQLite from 'expo-sqlite';
import type { Favorite, Observation } from '@/types/domain';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await SQLite.openDatabaseAsync('agua-na-rua.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS favorites (point_id TEXT PRIMARY KEY NOT NULL, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY NOT NULL, point_id TEXT NOT NULL, condition TEXT NOT NULL,
          description TEXT, observed_at TEXT NOT NULL, source TEXT NOT NULL, is_demo INTEGER NOT NULL
        );
      `);
      return db;
    })();
  }
  return databasePromise;
}

export async function listFavorites(): Promise<Favorite[]> {
  const db = await getDatabase();
  return db.getAllAsync<Favorite>('SELECT point_id as pointId, created_at as createdAt FROM favorites ORDER BY created_at DESC');
}

export async function isFavorite(pointId: string) {
  const db = await getDatabase();
  return !!(await db.getFirstAsync<{ point_id: string }>('SELECT point_id FROM favorites WHERE point_id = ?', pointId));
}

export async function toggleFavorite(pointId: string) {
  const db = await getDatabase();
  if (await isFavorite(pointId)) await db.runAsync('DELETE FROM favorites WHERE point_id = ?', pointId);
  else await db.runAsync('INSERT INTO favorites (point_id, created_at) VALUES (?, ?)', pointId, new Date().toISOString());
}

export async function listReports(pointId?: string): Promise<Observation[]> {
  const db = await getDatabase();
  type ReportRow = Omit<Observation, 'isDemo'> & { isDemo: number };
  const rows = pointId
    ? await db.getAllAsync<ReportRow>('SELECT id, point_id as pointId, condition, description, observed_at as observedAt, source, is_demo as isDemo FROM reports WHERE point_id = ? ORDER BY observed_at DESC', pointId)
    : await db.getAllAsync<ReportRow>('SELECT id, point_id as pointId, condition, description, observed_at as observedAt, source, is_demo as isDemo FROM reports ORDER BY observed_at DESC');
  return rows.map((row) => ({ ...row, isDemo: Boolean(row.isDemo) }));
}

export async function saveReport(report: Observation) {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO reports (id, point_id, condition, description, observed_at, source, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?)', report.id, report.pointId, report.condition, report.description ?? null, report.observedAt, report.source, Number(report.isDemo));
}
