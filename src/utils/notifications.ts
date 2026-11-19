import { NotificationLogItem, Reminder } from '../types/reminder';
import { formatCurrency, getReminderWindowMetrics, toLocalDateString } from './dateRange';

export type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as PermissionState;
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as PermissionState;
  } catch {
    return Notification.permission as PermissionState;
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

  const options: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
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

export async function evaluateAndDispatchAlerts(
  reminders: Reminder[],
  existingLogs: NotificationLogItem[],
  pushEnabled: boolean
): Promise<NotificationLogItem[]> {
  if (!pushEnabled) return [];

  const todayKey = toLocalDateString(new Date());
  const alreadySentKeys = new Set(
    existingLogs.map((log) => `${log.reminderId}:${log.triggerType}:${log.dateKey}`)
  );

  const newlyTriggered: NotificationLogItem[] = [];

  for (const reminder of reminders) {
    if (reminder.completed) continue;
    const metrics = getReminderWindowMetrics(reminder);
    const amountLabel = formatCurrency(reminder.amount, reminder.currency);
    const amountSuffix = amountLabel ? ` · ${amountLabel}` : '';

    let triggerType: NotificationLogItem['triggerType'] | null = null;
    let title = '';
    let body = '';

    if (metrics.status === 'overdue') {
      triggerType = 'overdue';
      title = `Overdue: ${reminder.title}`;
      body = `${reminder.provider}${amountSuffix} window closed on ${reminder.endDate}.`;
    } else if (metrics.daysRemaining === 0 && reminder.notifyDaysBefore.includes(0)) {
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
