import { addDaysToDateString, toLocalDateString } from './dateRange';

const REMINDERS_KEY = 'dueledger_reminders_v1';
const LOGS_KEY = 'dueledger_notif_logs_v1';
const SETTINGS_KEY = 'dueledger_settings_v1';
const INITIALIZED_KEY = 'dueledger_initialized_v1';

const DB_NAME = 'DueLedgerOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

export const DEFAULT_SETTINGS = {
  pushEnabled: true,
  defaultLeadDays: [3, 1, 0],
  defaultCurrency: 'INR',
  autoCheckOnLaunch: true,
};

export function createStarterReminders() {
  const today = toLocalDateString(new Date());
  const nowIso = new Date().toISOString();

  return [
    {
      id: 'rem-cc-sapphire',
      title: 'Credit Card Statement Window',
      provider: 'Chase Sapphire Preferred',
      accountRef: '•••• 4821',
      category: 'credit_card',
      startDate: addDaysToDateString(today, -10),
      endDate: addDaysToDateString(today, 2),
      amount: 1480.5,
      currency: 'INR',
      notifyDaysBefore: [7, 3, 1, 0],
      notifyOnStart: true,
      recurrence: 'monthly',
      notes: 'Pay full statement balance before closing window to avoid interest.',
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'rem-bank-fd',
      title: 'Fixed Deposit Maturity Window',
      provider: 'Citibank Personal Savings',
      accountRef: 'FD-90341',
      category: 'banking',
      startDate: addDaysToDateString(today, -4),
      endDate: addDaysToDateString(today, 9),
      amount: 12500,
      currency: 'INR',
      notifyDaysBefore: [7, 3, 1, 0],
      notifyOnStart: true,
      recurrence: 'annual',
      notes: '12-month CD renewal grace period. Decide whether to roll over or transfer.',
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'rem-auto-loan',
      title: 'Auto Loan EMI Payment Window',
      provider: 'Ally Financial',
      accountRef: 'LN-7712',
      category: 'loan_emi',
      startDate: addDaysToDateString(today, 2),
      endDate: addDaysToDateString(today, 12),
      amount: 465,
      currency: 'INR',
      notifyDaysBefore: [3, 1, 0],
      notifyOnStart: true,
      recurrence: 'monthly',
      notes: 'Verify checking account balance prior to autopay sweep.',
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'rem-fiber-net',
      title: 'Fiber Internet & Mobile Billing',
      provider: 'Verizon Fiber',
      accountRef: 'VZ-3019',
      category: 'utilities',
      startDate: addDaysToDateString(today, -6),
      endDate: addDaysToDateString(today, 5),
      amount: 89.99,
      currency: 'INR',
      notifyDaysBefore: [3, 1, 0],
      notifyOnStart: false,
      recurrence: 'monthly',
      notes: 'Download monthly PDF invoice for home office reimbursement.',
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'rem-auto-ins',
      title: 'Vehicle Insurance Renewal Window',
      provider: 'Progressive Policy',
      accountRef: 'POL-88420',
      category: 'insurance',
      startDate: addDaysToDateString(today, 6),
      endDate: addDaysToDateString(today, 21),
      amount: 640,
      currency: 'INR',
      notifyDaysBefore: [7, 3, 1, 0],
      notifyOnStart: true,
      recurrence: 'annual',
      notes: 'Compare renewal quote before automatic draft.',
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

function openIDB() {
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

async function idbGet(key) {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(key, value) {
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

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

export async function loadAppState() {
  const initialized =
    (await idbGet(INITIALIZED_KEY)) ?? lsGet(INITIALIZED_KEY);

  let reminders =
    (await idbGet(REMINDERS_KEY)) ?? lsGet(REMINDERS_KEY);

  if (!initialized && !reminders) {
    reminders = createStarterReminders();
    await saveReminders(reminders);
    await idbSet(INITIALIZED_KEY, true);
    lsSet(INITIALIZED_KEY, true);
  }

  const logs =
    (await idbGet(LOGS_KEY)) ??
    lsGet(LOGS_KEY) ??
    [];

  const settings =
    (await idbGet(SETTINGS_KEY)) ??
    lsGet(SETTINGS_KEY) ??
    DEFAULT_SETTINGS;

  return {
    reminders: (reminders ?? []).map((r) => ({ ...r, currency: 'INR' })),
    logs,
    settings: { ...DEFAULT_SETTINGS, ...settings, defaultCurrency: 'INR' },
  };
}

export async function saveReminders(reminders) {
  lsSet(REMINDERS_KEY, reminders);
  await idbSet(REMINDERS_KEY, reminders);
}

export async function saveNotificationLogs(logs) {
  const trimmed = logs.slice(0, 100);
  lsSet(LOGS_KEY, trimmed);
  await idbSet(LOGS_KEY, trimmed);
}

export async function saveSettings(settings) {
  lsSet(SETTINGS_KEY, settings);
  await idbSet(SETTINGS_KEY, settings);
}
