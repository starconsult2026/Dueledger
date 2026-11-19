import * as SQLite from 'expo-sqlite';
import type {
  AppSettings,
  NotificationLog,
  NotificationTriggerType,
  RecurrenceRule,
  Reminder,
  ServiceCategory,
} from '../types/reminder';
import {
  SQLITE_DB_NAME,
  SQLITE_MIGRATION_V1,
  SQLITE_SCHEMA_VERSION,
} from './sqliteSchema';
import { createStarterReminders, DEFAULT_SETTINGS } from './starterData';

export { createStarterReminders, DEFAULT_SETTINGS };

export interface LoadedAppState {
  reminders: Reminder[];
  logs: NotificationLog[];
  settings: AppSettings;
}

interface ReminderRow {
  id: string;
  title: string;
  provider: string;
  account_ref: string | null;
  category: string;
  start_date: string;
  end_date: string;
  amount: number | null;
  currency: string;
  notify_days_before: string;
  notify_on_start: number;
  recurrence: string;
  notes: string | null;
  completed: number;
  completed_at: string | null;
  calendar_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationLogRow {
  id: string;
  reminder_id: string;
  title: string;
  body: string;
  sent_at: string;
  date_key: string;
  trigger_type: string;
}

interface SettingsRow {
  id: number;
  push_enabled: number;
  default_lead_days: string;
  default_currency: string;
  auto_check_on_launch: number;
}

interface MetaRow {
  value: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(SQLITE_DB_NAME);
      const versionRow = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
      );
      const currentVersion = versionRow?.user_version ?? 0;
      if (currentVersion < SQLITE_SCHEMA_VERSION) {
        await db.execAsync(SQLITE_MIGRATION_V1);
        await db.execAsync(`PRAGMA user_version = ${SQLITE_SCHEMA_VERSION}`);
      }
      return db;
    })();
  }
  return dbPromise;
}

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function mapReminderRow(row: ReminderRow): Reminder {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider,
    accountRef: row.account_ref ?? undefined,
    category: row.category as ServiceCategory,
    startDate: row.start_date,
    endDate: row.end_date,
    amount: row.amount ?? undefined,
    currency: 'INR',
    notifyDaysBefore: parseJsonArray<number>(row.notify_days_before, []),
    notifyOnStart: row.notify_on_start === 1,
    recurrence: row.recurrence as RecurrenceRule,
    notes: row.notes ?? undefined,
    completed: row.completed === 1,
    completedAt: row.completed_at ?? undefined,
    calendarSyncedAt: row.calendar_synced_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLogRow(row: NotificationLogRow): NotificationLog {
  return {
    id: row.id,
    reminderId: row.reminder_id,
    title: row.title,
    body: row.body,
    sentAt: row.sent_at,
    dateKey: row.date_key,
    triggerType: row.trigger_type as NotificationTriggerType,
  };
}

export async function loadAppState(): Promise<LoadedAppState> {
  const db = await getDatabase();
  const initializedRow = await db.getFirstAsync<MetaRow>(
    'SELECT value FROM app_meta WHERE key = ?',
    'initialized'
  );

  let reminderRows = await db.getAllAsync<ReminderRow>(
    'SELECT * FROM reminders ORDER BY completed ASC, end_date ASC'
  );

  if (!initializedRow && reminderRows.length === 0) {
    const starters = createStarterReminders();
    await saveReminders(starters);
    await db.runAsync(
      'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)',
      'initialized',
      'true'
    );
    reminderRows = await db.getAllAsync<ReminderRow>(
      'SELECT * FROM reminders ORDER BY completed ASC, end_date ASC'
    );
  }

  const logRows = await db.getAllAsync<NotificationLogRow>(
    'SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 100'
  );

  const settingsRow = await db.getFirstAsync<SettingsRow>(
    'SELECT * FROM app_settings WHERE id = 1'
  );

  const settings: AppSettings = settingsRow
    ? {
        pushEnabled: settingsRow.push_enabled === 1,
        defaultLeadDays: parseJsonArray<number>(
          settingsRow.default_lead_days,
          DEFAULT_SETTINGS.defaultLeadDays
        ),
        defaultCurrency: 'INR',
        autoCheckOnLaunch: settingsRow.auto_check_on_launch === 1,
      }
    : DEFAULT_SETTINGS;

  return {
    reminders: reminderRows.map(mapReminderRow),
    logs: logRows.map(mapLogRow),
    settings,
  };
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM reminders');
    for (const r of reminders) {
      await db.runAsync(
        `INSERT INTO reminders (
          id, title, provider, account_ref, category,
          start_date, end_date, amount, currency,
          notify_days_before, notify_on_start, recurrence, notes,
          completed, completed_at, calendar_synced_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        r.id,
        r.title,
        r.provider,
        r.accountRef ?? null,
        r.category,
        r.startDate,
        r.endDate,
        r.amount ?? null,
        'INR',
        JSON.stringify(r.notifyDaysBefore),
        r.notifyOnStart ? 1 : 0,
        r.recurrence,
        r.notes ?? null,
        r.completed ? 1 : 0,
        r.completedAt ?? null,
        r.calendarSyncedAt ?? null,
        r.createdAt,
        r.updatedAt
      );
    }
  });
}

export async function saveNotificationLogs(
  logs: NotificationLog[]
): Promise<void> {
  const db = await getDatabase();
  const trimmed = logs.slice(0, 100);
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM notification_logs');
    for (const log of trimmed) {
      await db.runAsync(
        `INSERT INTO notification_logs (
          id, reminder_id, title, body, sent_at, date_key, trigger_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        log.id,
        log.reminderId,
        log.title,
        log.body,
        log.sentAt,
        log.dateKey,
        log.triggerType
      );
    }
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (
      id, push_enabled, default_lead_days, default_currency, auto_check_on_launch
    ) VALUES (1, ?, ?, ?, ?)`,
    settings.pushEnabled ? 1 : 0,
    JSON.stringify(settings.defaultLeadDays),
    'INR',
    settings.autoCheckOnLaunch ? 1 : 0
  );
}
