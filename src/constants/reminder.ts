import type { RecurrenceRule, ServiceCategory } from '../types/reminder';

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  banking: 'Personal Banking',
  credit_card: 'Credit Card',
  loan_emi: 'Loan & EMI',
  utilities: 'Utilities & Bills',
  insurance: 'Insurance',
  subscription: 'Service & SaaS',
  tax_govt: 'Tax & Gov',
  other: 'Others',
};

export const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  none: 'One-time window',
  monthly: 'Repeats monthly',
  quarterly: 'Repeats quarterly',
  annual: 'Repeats annually',
};
