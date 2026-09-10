import * as SQLite from "expo-sqlite";
import type { AppSettings, Task } from "../types";

const database = SQLite.openDatabaseSync("actv.db");

const defaultSettings: AppSettings = {
  language: "English",
  homeMode: "current",
  mapShowDone: false,
  mapShowFuture: false,
  startHour: 7,
  accentColor: "#22c55e",
  homeLatitude: undefined,
  homeLongitude: undefined,
  homePlace: "",
  workLatitude: undefined,
  workLongitude: undefined,
  workPlace: "",
  pitchLatitude: undefined,
  pitchLongitude: undefined,
  pitchPlace: "",
};

function initializeDatabase() {
  database.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      data TEXT NOT NULL
    );
  `);
}

initializeDatabase();

export function loadTasks(): Task[] {
  const rows = database.getAllSync<{ data: string }>("SELECT data FROM tasks");
  return rows.map((row) => JSON.parse(row.data) as Task);
}

export function saveTask(task: Task) {
  database.runSync(
    "INSERT OR REPLACE INTO tasks (id, data) VALUES (?, ?)",
    task.id,
    JSON.stringify(task),
  );
}

export function removeTask(id: string) {
  database.runSync("DELETE FROM tasks WHERE id = ?", id);
}

export function loadSettings(): AppSettings {
  const row = database.getFirstSync<{ data: string }>(
    "SELECT data FROM app_settings WHERE id = 1",
  );
  return row
    ? { ...defaultSettings, ...JSON.parse(row.data) }
    : defaultSettings;
}

export function saveSettings(settings: AppSettings) {
  database.runSync(
    "INSERT OR REPLACE INTO app_settings (id, data) VALUES (1, ?)",
    JSON.stringify(settings),
  );
}
