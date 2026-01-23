import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'auction.db');
    db = new Database(dbPath);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Initialize schema
    initSchema();
  }
  return db;
}

function initSchema() {
  if (!db) return;

  // Create entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      guess_value INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_entries_session_id ON entries(session_id);
    CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at);
  `);
}

export interface Entry {
  id: string;
  session_id: string;
  guess_value: number;
  created_at: string;
  updated_at: string;
}

export function createEntry(sessionId: string, guessValue: number): Entry {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO entries (id, session_id, guess_value, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, sessionId, guessValue, now, now);

  return {
    id,
    session_id: sessionId,
    guess_value: guessValue,
    created_at: now,
    updated_at: now,
  };
}

export function getEntryBySessionId(sessionId: string): Entry | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM entries WHERE session_id = ?');
  return stmt.get(sessionId) as Entry | null;
}

export function getAllEntries(): Entry[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM entries ORDER BY created_at ASC');
  return stmt.all() as Entry[];
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
