export const SQLITE_DB_NAME = 'dueledger.db';
export const SQLITE_SCHEMA_VERSION = 1;

export const SQLITE_MIGRATION_V1 = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  account_ref TEXT,
  category TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  amount REAL,
  currency TEXT NOT NULL DEFAULT 'INR',
  notify_days_before TEXT NOT NULL DEFAULT '[]',
  notify_on_start INTEGER NOT NULL DEFAULT 1,
  recurrence TEXT NOT NULL DEFAULT 'none',
  notes TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  calendar_synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_end_date ON reminders (end_date);
CREATE INDEX IF NOT EXISTS idx_reminders_category ON reminders (category);

CREATE TABLE IF NOT EXISTS notification_logs (
  id TEXT PRIMARY KEY NOT NULL,
  reminder_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  date_key TEXT NOT NULL,
  trigger_type TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_sent_at ON notification_logs (sent_at DESC);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  push_enabled INTEGER NOT NULL DEFAULT 1,
  default_lead_days TEXT NOT NULL DEFAULT '[3,1,0]',
  default_currency TEXT NOT NULL DEFAULT 'INR',
  auto_check_on_launch INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;
