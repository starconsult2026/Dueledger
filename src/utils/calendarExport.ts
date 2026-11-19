import { CATEGORY_LABELS, Reminder } from '../types/reminder';
import { addDaysToDateString, formatCurrency } from './dateRange';

function toCompactDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatUtcTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Builds a direct Google Calendar event template link spanning the reminder's date range.
 * Google Calendar all-day end dates are exclusive, so we add 1 day to endDate.
 */
export function buildGoogleCalendarUrl(reminder: Reminder): string {
  const startCompact = toCompactDate(reminder.startDate);
  const endCompact = toCompactDate(addDaysToDateString(reminder.endDate, 1));
  const formattedAmount = formatCurrency(reminder.amount, reminder.currency);

  const lines = [
    `Provider: ${reminder.provider}`,
    `Category: ${CATEGORY_LABELS[reminder.category]}`,
    reminder.accountRef ? `Reference: ${reminder.accountRef}` : null,
    formattedAmount ? `Amount: ${formattedAmount}` : null,
    `Action Window: ${reminder.startDate} to ${reminder.endDate}`,
    reminder.notes ? `Notes: ${reminder.notes}` : null,
  ].filter(Boolean);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${reminder.title} (${reminder.provider})`,
    dates: `${startCompact}/${endCompact}`,
    details: lines.join('\n'),
  });

  if (reminder.recurrence === 'monthly') {
    params.set('recur', 'RRULE:FREQ=MONTHLY');
  } else if (reminder.recurrence === 'quarterly') {
    params.set('recur', 'RRULE:FREQ=MONTHLY;INTERVAL=3');
  } else if (reminder.recurrence === 'annual') {
    params.set('recur', 'RRULE:FREQ=YEARLY');
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an RFC 5545 compliant .ics calendar file for Google Calendar / Android Calendar import.
 */
export function generateIcsContent(reminders: Reminder[]): string {
  const nowStamp = formatUtcTimestamp(new Date());
  const events = reminders.map((reminder) => {
    const dtStart = toCompactDate(reminder.startDate);
    const dtEnd = toCompactDate(addDaysToDateString(reminder.endDate, 1));
    const formattedAmount = formatCurrency(reminder.amount, reminder.currency);

    const descParts = [
      `Provider: ${reminder.provider}`,
      `Category: ${CATEGORY_LABELS[reminder.category]}`,
      reminder.accountRef ? `Account Ref: ${reminder.accountRef}` : null,
      formattedAmount ? `Amount: ${formattedAmount}` : null,
      `Date Window: ${reminder.startDate} to ${reminder.endDate}`,
      reminder.notes ? `Notes: ${reminder.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const alarms = (reminder.notifyDaysBefore.length > 0 ? reminder.notifyDaysBefore : [1])
      .map((daysBefore) => {
        const trigger = daysBefore === 0 ? '-PT0M' : `-P${daysBefore}D`;
        return [
          'BEGIN:VALARM',
          'ACTION:DISPLAY',
          `DESCRIPTION:${escapeIcsText(`${reminder.title} due by ${reminder.endDate}`)}`,
          `TRIGGER;RELATED=END:${trigger}`,
          'END:VALARM',
        ].join('\r\n');
      })
      .join('\r\n');

    const rrule =
      reminder.recurrence === 'monthly'
        ? 'RRULE:FREQ=MONTHLY\r\n'
        : reminder.recurrence === 'quarterly'
          ? 'RRULE:FREQ=MONTHLY;INTERVAL=3\r\n'
          : reminder.recurrence === 'annual'
            ? 'RRULE:FREQ=YEARLY\r\n'
            : '';

    return [
      'BEGIN:VEVENT',
      `UID:${reminder.id}@dueledger.app`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${escapeIcsText(`${reminder.title} — ${reminder.provider}`)}`,
      `DESCRIPTION:${escapeIcsText(descParts)}`,
      `CATEGORIES:${escapeIcsText(CATEGORY_LABELS[reminder.category])}`,
      `${rrule}STATUS:${reminder.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      alarms,
      'END:VEVENT',
    ]
      .filter(Boolean)
      .join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DueLedger//Bank & Service Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:DueLedger Bank & Service Reminders',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(reminders: Reminder[], filename: string): void {
  const content = generateIcsContent(reminders);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
