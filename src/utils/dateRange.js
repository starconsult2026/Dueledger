export function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

export function diffCalendarDays(fromStr, toStr) {
  const from = parseLocalDate(fromStr);
  const to = parseLocalDate(toStr);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function addDaysToDateString(dateStr, days) {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}

export function formatShortDate(dateStr) {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(dateStr) {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCurrency(amount, currency = 'INR') {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return null;
  const targetCurrency = currency || 'INR';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: targetCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${Number(amount).toFixed(2)}`;
  }
}

export function getReminderWindowMetrics(reminder, referenceDate = new Date()) {
  const todayStr = toLocalDateString(referenceDate);
  const totalDays = Math.max(1, diffCalendarDays(reminder.startDate, reminder.endDate) + 1);
  const daysUntilStart = diffCalendarDays(todayStr, reminder.startDate);
  const daysRemaining = diffCalendarDays(todayStr, reminder.endDate);
  const elapsedDays = Math.max(
    0,
    Math.min(totalDays, diffCalendarDays(reminder.startDate, todayStr) + 1)
  );

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

export function overlapsDateRange(reminder, rangeStart, rangeEnd) {
  if (!rangeStart && !rangeEnd) return true;
  if (rangeStart && reminder.endDate < rangeStart) return false;
  if (rangeEnd && reminder.startDate > rangeEnd) return false;
  return true;
}

export function advanceDateByRecurrence(dateStr, recurrence) {
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
