import type {
  NotificationLog,
  NotificationPermissionState,
  NotificationTriggerType,
  Reminder,
} from '../types/reminder';
import {
  formatCurrency,
  getReminderWindowMetrics,
  toLocalDateString,
} from './dateRange';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function getNotificationPermissionAsync(): Promise<NotificationPermissionState> {
  return getNotificationPermission();
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function dispatchLocalPushNotification(
  title: string,
  body: string,
  tag?: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  const options: NotificationOptions & {
    renotify?: boolean;
    vibrate?: number[];
  } = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: tag || `dueledger-${Date.now()}`,
    renotify: Boolean(tag),
    vibrate: [120, 60, 120],
    data: { url: '/' },
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
      ]);
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return true;
      }
    }
    new Notification(title, options);
    return true;
  } catch {
    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }
}

export async function syncScheduledReminderNotifications(
  reminders: Reminder[],
  pushEnabled: boolean
): Promise<number> {
  if (!pushEnabled || getNotificationPermission() !== 'granted') {
    return 0;
  }
  const now = new Date();
  const todayStr = toLocalDateString(now);
  let plannedCount = 0;
  for (const r of reminders) {
    if (r.completed) continue;
    if (r.notifyOnStart && r.startDate >= todayStr) plannedCount += 1;
    for (const lead of r.notifyDaysBefore) {
      if (r.endDate >= todayStr && lead >= 0) plannedCount += 1;
    }
  }
  return plannedCount;
}

export async function evaluateAndDispatchAlerts(
  reminders: Reminder[],
  existingLogs: NotificationLog[],
  pushEnabled: boolean
): Promise<NotificationLog[]> {
  if (!pushEnabled) return [];

  const todayKey = toLocalDateString(new Date());
  const alreadySentKeys = new Set(
    existingLogs.map((log) => `${log.reminderId}:${log.triggerType}:${log.dateKey}`)
  );

  const newlyTriggered: NotificationLog[] = [];

  for (const reminder of reminders) {
    if (reminder.completed) continue;
    const metrics = getReminderWindowMetrics(reminder);
    const amountLabel = formatCurrency(reminder.amount, reminder.currency);
    const amountSuffix = amountLabel ? ` · ${amountLabel}` : '';

    let triggerType: NotificationTriggerType | null = null;
    let title = '';
    let body = '';

    if (metrics.status === 'overdue') {
      triggerType = 'overdue';
      title = `Overdue: ${reminder.title}`;
      body = `${reminder.provider}${amountSuffix} window closed on ${reminder.endDate}.`;
    } else if (
      metrics.daysRemaining === 0 &&
      reminder.notifyDaysBefore.includes(0)
    ) {
      triggerType = 'due_today';
      title = `Due Today: ${reminder.title}`;
      body = `${reminder.provider}${amountSuffix} · Final day of ${reminder.startDate}–${reminder.endDate} window.`;
    } else if (
      metrics.daysRemaining > 0 &&
      reminder.notifyDaysBefore.includes(metrics.daysRemaining)
    ) {
      triggerType = 'lead_time';
      title = `${metrics.daysRemaining}d left: ${reminder.title}`;
      body = `${reminder.provider}${amountSuffix} closes on ${reminder.endDate}.`;
    } else if (reminder.notifyOnStart && metrics.daysUntilStart === 0) {
      triggerType = 'start_window';
      title = `Window Open: ${reminder.title}`;
      body = `${reminder.provider}${amountSuffix} · Open ${reminder.startDate} through ${reminder.endDate}.`;
    }

    if (!triggerType) continue;

    const dedupeKey = `${reminder.id}:${triggerType}:${todayKey}`;
    if (alreadySentKeys.has(dedupeKey)) continue;

    await dispatchLocalPushNotification(title, body, dedupeKey);

    newlyTriggered.push({
      id: `notif-${reminder.id}-${triggerType}-${Date.now()}`,
      reminderId: reminder.id,
      title,
      body,
      sentAt: new Date().toISOString(),
      dateKey: todayKey,
      triggerType,
    });
    alreadySentKeys.add(dedupeKey);
  }

  return newlyTriggered;
}
