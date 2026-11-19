export type ServiceCategory =
  | 'banking'
  | 'credit_card'
  | 'loan_emi'
  | 'utilities'
  | 'insurance'
  | 'subscription'
  | 'tax_govt'
  | 'other';

export type RecurrencePattern = 'none' | 'monthly' | 'quarterly' | 'annual';

export type ReminderStatus =
  | 'upcoming'
  | 'active'
  | 'due_soon'
  | 'overdue'
  | 'completed';

export interface Reminder {
  id: string;
  title: string;
  provider: string;
  accountRef?: string;
  category: ServiceCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  amount?: number;
  currency: string;
  notifyDaysBefore: number[];
  notifyOnStart: boolean;
  recurrence: RecurrencePattern;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  calendarSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLogItem {
  id: string;
  reminderId: string;
  title: string;
  body: string;
  sentAt: string;
  dateKey: string; // YYYY-MM-DD for daily deduplication
  triggerType: 'start_window' | 'lead_time' | 'due_today' | 'overdue' | 'manual_test';
}

export interface AppSettings {
  pushEnabled: boolean;
  defaultLeadDays: number[];
  defaultCurrency: string;
  autoCheckOnLaunch: boolean;
}

export type DateRangePreset =
  | 'all'
  | 'active_now'
  | 'next_7_days'
  | 'this_month'
  | 'custom';

export type ActiveTab = 'reminders' | 'timeline' | 'alerts' | 'settings';

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  banking: 'Personal Banking',
  credit_card: 'Credit Card',
  loan_emi: 'Loan & EMI',
  utilities: 'Utilities & Bills',
  insurance: 'Insurance',
  subscription: 'Service & SaaS',
  tax_govt: 'Tax & Gov',
  other: 'Other Service',
};

export const RECURRENCE_LABELS: Record<RecurrencePattern, string> = {
  none: 'One-time window',
  monthly: 'Repeats monthly',
  quarterly: 'Repeats quarterly',
  annual: 'Repeats annually',
};
