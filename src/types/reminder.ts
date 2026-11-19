export type ServiceCategory =
  | 'banking'
  | 'credit_card'
  | 'loan_emi'
  | 'utilities'
  | 'insurance'
  | 'subscription'
  | 'tax_govt'
  | 'other';

export type RecurrenceRule = 'none' | 'monthly' | 'quarterly' | 'annual';

export type CurrencyCode = 'INR';

export type ReminderStatus =
  | 'upcoming'
  | 'active'
  | 'due_soon'
  | 'overdue'
  | 'completed';

export type AppTab = 'reminders' | 'timeline' | 'alerts' | 'settings';

export type DateRangePreset =
  | 'all'
  | 'active_now'
  | 'next_7_days'
  | 'this_month'
  | 'custom';

export type NotificationTriggerType =
  | 'overdue'
  | 'due_today'
  | 'lead_time'
  | 'start_window'
  | 'manual_test';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export interface Reminder {
  id: string;
  title: string;
  provider: string;
  accountRef?: string;
  category: ServiceCategory;
  startDate: string;
  endDate: string;
  amount?: number;
  currency: CurrencyCode;
  notifyDaysBefore: number[];
  notifyOnStart: boolean;
  recurrence: RecurrenceRule;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  calendarSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderInput = Omit<
  Reminder,
  'id' | 'completed' | 'createdAt' | 'updatedAt'
>;

export interface ReminderWindowMetrics {
  status: ReminderStatus;
  statusLabel: string;
  totalDays: number;
  elapsedDays: number;
  daysRemaining: number;
  daysUntilStart: number;
  progressPercent: number;
}

export interface NotificationLog {
  id: string;
  reminderId: string;
  title: string;
  body: string;
  sentAt: string;
  dateKey: string;
  triggerType: NotificationTriggerType;
}

export interface AppSettings {
  pushEnabled: boolean;
  defaultLeadDays: number[];
  defaultCurrency: CurrencyCode;
  autoCheckOnLaunch: boolean;
}
