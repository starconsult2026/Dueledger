import { RecurrencePattern, Reminder, ReminderStatus } from '../types/reminder';

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

export function diffCalendarDays(fromStr: string, toStr: string): number {
  const from = parseLocalDate(fromStr);
  const to = parseLocalDate(toStr);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}

export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number | undefined, currency: string): string | null {
  if (amount === undefined || Number.isNaN(amount)) return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export interface WindowMetrics {
  status: ReminderStatus;
  statusLabel: string;
  totalDays: number;
  elapsedDays: number;
  daysRemaining: number;
  daysUntilStart: number;
  progressPercent: number;
}

export function getReminderWindowMetrics(
  reminder: Reminder,
  referenceDate: Date = new Date()
): WindowMetrics {
  const todayStr = toLocalDateString(referenceDate);
  const totalDays = Math.max(1, diffCalendarDays(reminder.startDate, reminder.endDate) + 1);
  const daysUntilStart = diffCalendarDays(todayStr, reminder.startDate);
  const daysRemaining = diffCalendarDays(todayStr, reminder.endDate);
  const elapsedDays = Math.max(0, Math.min(totalDays, diffCalendarDays(reminder.startDate, todayStr) + 1));

  if (reminder.completed) {
    return {
      status: 'completed',
      statusLabel: 'Completed',
      totalDays,
      elapsedDays: totalDays,
      daysRemaining: 0,
      daysUntilStart: 0,
      progressPercent: 100,
    };
  }

  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return {
      status: 'overdue',
      statusLabel: `Overdue ${overdueDays}d`,
      totalDays,
      elapsedDays: totalDays,
      daysRemaining,
      daysUntilStart,
      progressPercent: 100,
    };
  }

  if (daysUntilStart > 0) {
    return {
      status: 'upcoming',
      statusLabel: daysUntilStart === 1 ? 'Starts tomorrow' : `Starts in ${daysUntilStart}d`,
      totalDays,
      elapsedDays: 0,
      daysRemaining,
      daysUntilStart,
      progressPercent: 0,
    };
  }

  const progressPercent = Math.min(100, Math.max(4, Math.round((elapsedDays / totalDays) * 100)));

  if (daysRemaining === 0) {
    return {
      status: 'due_soon',
      statusLabel: 'Due today',
      totalDays,
      elapsedDays,
      daysRemaining,
      daysUntilStart,
      progressPercent,
    };
  }

  if (daysRemaining <= 3) {
    return {
      status: 'due_soon',
      statusLabel: `${daysRemaining}d left`,
      totalDays,
      elapsedDays,
      daysRemaining,
      daysUntilStart,
      progressPercent,
    };
  }

  return {
    status: 'active',
    statusLabel: `${daysRemaining}d left`,
    totalDays,
    elapsedDays,
    daysRemaining,
    daysUntilStart,
    progressPercent,
  };
}

export function overlapsDateRange(
  reminder: Reminder,
  rangeStart: string,
  rangeEnd: string
): boolean {
  if (!rangeStart && !rangeEnd) return true;
  if (rangeStart && reminder.endDate < rangeStart) return false;
  if (rangeEnd && reminder.startDate > rangeEnd) return false;
  return true;
}

export function advanceDateByRecurrence(
  dateStr: string,
  recurrence: RecurrencePattern
): string {
  const date = parseLocalDate(dateStr);
  if (recurrence === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (recurrence === 'quarterly') {
    date.setMonth(date.getMonth() + 3);
  } else if (recurrence === 'annual') {
    date.setFullYear(date.getFullYear() + 1);
  }
  return toLocalDateString(date);
}
