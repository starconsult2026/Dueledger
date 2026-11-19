import type {
  AppSettings,
  NotificationLog,
  Reminder,
} from '../types/reminder';
import { createStarterReminders, DEFAULT_SETTINGS } from './starterData';

export { createStarterReminders, DEFAULT_SETTINGS };

const REMINDERS_KEY = 'dueledger_reminders_v1';
const LOGS_KEY = 'dueledger_notif_logs_v1';
const SETTINGS_KEY = 'dueledger_settings_v1';
const INITIALIZED_KEY = 'dueledger_initialized_v1';

const DB_NAME = 'DueLedgerOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

export interface LoadedAppState {
  reminders: Reminder[];
  logs: NotificationLog[];
  settings: AppSettings;
}

function openIDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openIDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

export async function loadAppState(): Promise<LoadedAppState> {
  const initialized =
    (await idbGet<boolean>(INITIALIZED_KEY)) ?? lsGet<boolean>(INITIALIZED_KEY);

  let reminders =
    (await idbGet<Reminder[]>(REMINDERS_KEY)) ?? lsGet<Reminder[]>(REMINDERS_KEY);

  if (!initialized && !reminders) {
    reminders = createStarterReminders();
    await saveReminders(reminders);
    await idbSet(INITIALIZED_KEY, true);
    lsSet(INITIALIZED_KEY, true);
  }

  const logs =
    (await idbGet<NotificationLog[]>(LOGS_KEY)) ??
    lsGet<NotificationLog[]>(LOGS_KEY) ??
    [];

  const settings =
    (await idbGet<Partial<AppSettings>>(SETTINGS_KEY)) ??
    lsGet<Partial<AppSettings>>(SETTINGS_KEY) ??
    DEFAULT_SETTINGS;

  return {
    reminders: (reminders ?? []).map((r) => ({ ...r, currency: 'INR' })),
    logs,
    settings: { ...DEFAULT_SETTINGS, ...settings, defaultCurrency: 'INR' },
  };
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  lsSet(REMINDERS_KEY, reminders);
  await idbSet(REMINDERS_KEY, reminders);
}

export async function saveNotificationLogs(
  logs: NotificationLog[]
): Promise<void> {
  const trimmed = logs.slice(0, 100);
  lsSet(LOGS_KEY, trimmed);
  await idbSet(LOGS_KEY, trimmed);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  lsSet(SETTINGS_KEY, settings);
  await idbSet(SETTINGS_KEY, settings);
}
