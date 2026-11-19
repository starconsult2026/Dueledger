import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_LABELS, RECURRENCE_LABELS } from '../constants/reminder';
import {
  addDaysToDateString,
  diffCalendarDays,
  toLocalDateString,
} from '../utils/dateRange';

const TEMPLATES = [
  {
    label: 'Credit Card Window',
    title: 'Credit Card Statement Payment',
    provider: 'Primary Bank Card',
    category: 'credit_card',
    spanDays: 14,
    recurrence: 'monthly',
  },
  {
    label: 'FD / CD Maturity',
    title: 'Fixed Deposit Renewal Window',
    provider: 'Personal Bank',
    category: 'banking',
    spanDays: 10,
    recurrence: 'annual',
  },
  {
    label: 'Loan EMI Window',
    title: 'Monthly Loan EMI Window',
    provider: 'Home / Auto Lender',
    category: 'loan_emi',
    spanDays: 7,
    recurrence: 'monthly',
  },
  {
    label: 'Utility Billing',
    title: 'Electricity & Water Bill Window',
    provider: 'City Utilities',
    category: 'utilities',
    spanDays: 12,
    recurrence: 'monthly',
  },
  {
    label: 'Insurance Renewal',
    title: 'Policy Grace & Renewal Window',
    provider: 'Insurance Carrier',
    category: 'insurance',
    spanDays: 15,
    recurrence: 'annual',
  },
  {
    label: 'Others',
    title: 'Personal Reminder Window',
    provider: 'personal',
    category: 'other',
    spanDays: 7,
    recurrence: 'none',
  },
];

const LEAD_DAY_OPTIONS = [
  { value: 7, label: '7 days before' },
  { value: 3, label: '3 days before' },
  { value: 1, label: '1 day before' },
  { value: 0, label: 'On end date' },
];

export const ReminderFormModal = ({
  open,
  initialReminder,
  defaultCurrency,
  defaultLeadDays,
  onClose,
  onSave,
}) => {
  const today = toLocalDateString(new Date());

  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [accountRef, setAccountRef] = useState('');
  const [category, setCategory] = useState('banking');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDaysToDateString(today, 10));
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [recurrence, setRecurrence] = useState('monthly');
  const [notifyOnStart, setNotifyOnStart] = useState(true);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(defaultLeadDays);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (initialReminder) {
      setTitle(initialReminder.title);
      setProvider(initialReminder.provider);
      setAccountRef(initialReminder.accountRef || '');
      setCategory(initialReminder.category);
      setStartDate(initialReminder.startDate);
      setEndDate(initialReminder.endDate);
      setAmount(
        initialReminder.amount !== undefined ? String(initialReminder.amount) : ''
      );
      setCurrency(initialReminder.currency || defaultCurrency);
      setRecurrence(initialReminder.recurrence);
      setNotifyOnStart(initialReminder.notifyOnStart);
      setNotifyDaysBefore(initialReminder.notifyDaysBefore);
      setNotes(initialReminder.notes || '');
    } else {
      setTitle('');
      setProvider('');
      setAccountRef('');
      setCategory('banking');
      setStartDate(today);
      setEndDate(addDaysToDateString(today, 10));
      setAmount('');
      setCurrency(defaultCurrency);
      setRecurrence('monthly');
      setNotifyOnStart(true);
      setNotifyDaysBefore(defaultLeadDays);
      setNotes('');
    }
  }, [open, initialReminder, defaultCurrency, defaultLeadDays, today]);

  if (!open) return null;

  const spanDays =
    startDate && endDate ? diffCalendarDays(startDate, endDate) + 1 : 0;

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setProvider(tpl.provider);
    setCategory(tpl.category);
    setRecurrence(tpl.recurrence);
    setStartDate(today);
    setEndDate(addDaysToDateString(today, tpl.spanDays));
  };

  const toggleLeadDay = (day) => {
    setNotifyDaysBefore((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => b - a)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a reminder title.');
      return;
    }
    if (!provider.trim()) {
      setError('Please enter the bank or service provider name.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select both a start date and an end date.');
      return;
    }
    if (endDate < startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    const parsedAmount = amount.trim() ? Number(amount) : undefined;
    if (amount.trim() && Number.isNaN(parsedAmount)) {
      setError('Amount must be a valid number.');
      return;
    }

    onSave({
      title: title.trim(),
      provider: provider.trim(),
      accountRef: accountRef.trim() || undefined,
      category,
      startDate,
      endDate,
      amount: parsedAmount,
      currency,
      notifyDaysBefore,
      notifyOnStart,
      recurrence,
      notes: notes.trim() || undefined,
      completedAt: initialReminder?.completedAt,
      calendarSyncedAt: initialReminder?.calendarSyncedAt,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-form-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="reminder-form-title" className="text-lg font-semibold text-slate-900">
            {initialReminder ? 'Edit Service Window' : 'New Bank or Service Reminder'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!initialReminder && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Quick Templates</p>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="min-h-[36px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-teal-600 hover:bg-teal-50 hover:text-teal-800 whitespace-nowrap"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Reminder Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., HDFC Credit Card Payment Window"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Bank or Service Provider
              </label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g., Chase Bank, City Water"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Service Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Action Date Range Window
              </span>
              <span className="text-xs font-medium text-teal-700 font-mono-nums">
                {spanDays > 0 ? `${spanDays}-day window` : 'Check dates'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600">Window Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStartDate(val);
                    if (endDate && val > endDate) {
                      setEndDate(val);
                    }
                  }}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 font-mono-nums focus:border-teal-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600">Due / Window End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 font-mono-nums focus:border-teal-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Amount (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 font-mono-nums focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Account / Ref
              </label>
              <input
                type="text"
                value={accountRef}
                onChange={(e) => setAccountRef(e.target.value)}
                placeholder="e.g., •••• 4821"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 font-mono-nums focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Recurrence Schedule
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
            >
              {Object.entries(RECURRENCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-700">Push Notification Triggers</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setNotifyOnStart((prev) => !prev)}
                className={`min-h-[38px] rounded-xl border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                  notifyOnStart
                    ? 'border-teal-700 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                When window starts
              </button>
              {LEAD_DAY_OPTIONS.map((opt) => {
                const active = notifyDaysBefore.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleLeadDay(opt.value)}
                    className={`min-h-[38px] rounded-xl border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                      active
                        ? 'border-teal-700 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment method, minimum due, or renewal instructions..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-teal-700 px-6 py-2 text-sm font-medium text-white shadow-xs hover:bg-teal-800 active:scale-[0.98]"
            >
              {initialReminder ? 'Save Changes' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
