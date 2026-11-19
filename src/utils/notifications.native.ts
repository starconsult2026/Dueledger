import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type {
  NotificationLog,
  NotificationPermissionState,
  NotificationTriggerType,
  Reminder,
} from '../types/reminder';
import {
  addDaysToDateString,
  formatCurrency,
  getReminderWindowMetrics,
  parseLocalDate,
  toLocalDateString,
} from './dateRange';

const ANDROID_CHANNEL_ID = 'dueledger-windows';
const DEFAULT_REMINDER_HOUR = 9;
const DEFAULT_REMINDER_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Bank & Service Window Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 180, 90, 180],
    lightColor: '#0F766E',
    sound: 'default',
    enableVibrate: true,
  });
}

function buildTriggerDateAtMorning(dateStr: string): Date | null {
  const target = parseLocalDate(dateStr);
  target.setHours(DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE, 0, 0);
  if (target.getTime() <= Date.now()) {
    return null;
  }
  return target;
}

export function getNotificationPermission(): NotificationPermissionState {
  return 'default';
}

export async function getNotificationPermissionAsync(): Promise<NotificationPermissionState> {
  try {
    const status = await Notifications.getPermissionsAsync();
    if (status.granted || status.status === 'granted') return 'granted';
    if (status.status === 'denied' && !status.canAskAgain) return 'denied';
    return status.status === 'denied' ? 'denied' : 'default';
  } catch {
    return 'unsupported';
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  try {
    await ensureAndroidChannel();
    const res = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
      android: {},
    });
    if (res.granted || res.status === 'granted') return 'granted';
    return res.status === 'denied' ? 'denied' : 'default';
  } catch {
    return 'unsupported';
  }
}

export async function dispatchLocalPushNotification(
  title: string,
  body: string,
  tag?: string
): Promise<boolean> {
  try {
    const perm = await getNotificationPermissionAsync();
    if (perm !== 'granted') return false;
    await ensureAndroidChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: tag,
      content: {
        title,
        body,
        sound: true,
        color: '#0F766E',
        vibrate: [120, 60, 120],
        data: { tag: tag ?? 'instant' },
      },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
}

export async function syncScheduledReminderNotifications(
  reminders: Reminder[],
  pushEnabled: boolean
): Promise<number> {
  try {
    const perm = await getNotificationPermissionAsync();
    if (!pushEnabled || perm !== 'granted') {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return 0;
    }

    await ensureAndroidChannel();
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    for (const req of existing) {
      if (req.content.data?.source === 'dueledger-window') {
        await Notifications.cancelScheduledNotificationAsync(req.identifier);
      }
    }

    let scheduledCount = 0;

    for (const reminder of reminders) {
      if (reminder.completed) continue;
      const amountLabel = formatCurrency(reminder.amount, reminder.currency);
      const amountSuffix = amountLabel ? ` · ${amountLabel}` : '';

      if (reminder.notifyOnStart) {
        const startTrigger = buildTriggerDateAtMorning(reminder.startDate);
        if (startTrigger) {
          await Notifications.scheduleNotificationAsync({
            identifier: `dueledger:${reminder.id}:start:${reminder.startDate}`,
            content: {
              title: `Window Open: ${reminder.title}`,
              body: `${reminder.provider}${amountSuffix} · Open ${reminder.startDate} through ${reminder.endDate}.`,
              sound: true,
              color: '#0F766E',
              data: {
                source: 'dueledger-window',
                reminderId: reminder.id,
                triggerType: 'start_window',
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: startTrigger,
              channelId: ANDROID_CHANNEL_ID,
            },
          });
          scheduledCount += 1;
        }
      }

      for (const leadDays of reminder.notifyDaysBefore) {
        const notifyDateStr = addDaysToDateString(reminder.endDate, -leadDays);
        const leadTrigger = buildTriggerDateAtMorning(notifyDateStr);
        if (!leadTrigger) continue;

        const title =
          leadDays === 0
            ? `Due Today: ${reminder.title}`
            : `${leadDays}d left: ${reminder.title}`;
        const body =
          leadDays === 0
            ? `${reminder.provider}${amountSuffix} · Final day of ${reminder.startDate}–${reminder.endDate} window.`
            : `${reminder.provider}${amountSuffix} closes on ${reminder.endDate}.`;

        await Notifications.scheduleNotificationAsync({
          identifier: `dueledger:${reminder.id}:lead:${leadDays}:${notifyDateStr}`,
          content: {
            title,
            body,
            sound: true,
            color: '#0F766E',
            data: {
              source: 'dueledger-window',
              reminderId: reminder.id,
              triggerType: leadDays === 0 ? 'due_today' : 'lead_time',
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: leadTrigger,
            channelId: ANDROID_CHANNEL_ID,
          },
        });
        scheduledCount += 1;
      }
    }

    return scheduledCount;
  } catch {
    return 0;
  }
}

export async function evaluateAndDispatchAlerts(
  reminders: Reminder[],
  existingLogs: NotificationLog[],
  pushEnabled: boolean
): Promise<NotificationLog[]> {
  if (!pushEnabled) return [];
  const perm = await getNotificationPermissionAsync();
  if (perm !== 'granted') return [];

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
