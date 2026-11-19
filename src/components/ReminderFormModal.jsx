import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CATEGORY_LABELS, RECURRENCE_LABELS } from '../constants/reminder';
import { COLORS, FONTS } from '../theme/tokens';
import {
  addDaysToDateString,
  diffCalendarDays,
  toLocalDateString,
} from '../utils/dateRange';
import { DateField } from './DateField';
import { CloseIcon } from './RNIcons';
import { SelectDropdown } from './SelectDropdown';

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);

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
      setRecurrence('monthly');
      setNotifyOnStart(true);
      setNotifyDaysBefore(defaultLeadDays);
      setNotes('');
    }
  }, [open, initialReminder, defaultCurrency, defaultLeadDays, today]);

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
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => b - a)
    );
  };

  const handleSubmit = () => {
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
      currency: 'INR',
      notifyDaysBefore,
      notifyOnStart,
      recurrence,
      notes: notes.trim() || undefined,
      completedAt: initialReminder?.completedAt,
      calendarSyncedAt: initialReminder?.calendarSyncedAt,
    });
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {initialReminder ? 'Edit Service Window' : 'New Bank or Service Reminder'}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close form"
              style={styles.closeBtn}
            >
              <CloseIcon size={18} color={COLORS.inkMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {!initialReminder && (
              <View style={styles.fieldGroup}>
                <Text style={styles.sectionMiniLabel}>Quick Templates</Text>
                <View style={styles.wrapRow}>
                  {TEMPLATES.map((tpl) => (
                    <Pressable
                      key={tpl.label}
                      onPress={() => applyTemplate(tpl)}
                      style={styles.templateBtn}
                    >
                      <Text style={styles.templateBtnText}>{tpl.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Reminder Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., HDFC Credit Card Payment Window"
                placeholderTextColor={COLORS.inkMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bank or Service Provider</Text>
              <TextInput
                value={provider}
                onChangeText={setProvider}
                placeholder="e.g., Chase Bank, City Water"
                placeholderTextColor={COLORS.inkMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Service Category</Text>
              <SelectDropdown
                value={category}
                options={CATEGORY_OPTIONS}
                onChange={setCategory}
                accessibilityLabel="Service Category"
              />
            </View>

            <View style={styles.dateBox}>
              <View style={styles.dateBoxHeader}>
                <Text style={styles.dateBoxTitle}>Action Date Range Window</Text>
                <Text style={styles.spanBadge}>
                  {spanDays > 0 ? `${spanDays}-day window` : 'Check dates'}
                </Text>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <Text style={styles.subLabel}>Window Start Date</Text>
                  <DateField
                    value={startDate}
                    onChange={(val) => {
                      setStartDate(val);
                      if (endDate && val > endDate) setEndDate(val);
                    }}
                    accessibilityLabel="Window Start Date"
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.subLabel}>Due / Window End Date</Text>
                  <DateField
                    value={endDate}
                    min={startDate}
                    onChange={setEndDate}
                    accessibilityLabel="Due or Window End Date"
                  />
                </View>
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Amount in ₹ (Optional)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.inkMuted}
                  style={[styles.input, styles.monoInput]}
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Account / Ref</Text>
                <TextInput
                  value={accountRef}
                  onChangeText={setAccountRef}
                  placeholder="e.g., •••• 4821"
                  placeholderTextColor={COLORS.inkMuted}
                  style={[styles.input, styles.monoInput]}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Recurrence Schedule</Text>
              <View style={styles.wrapRow}>
                {Object.entries(RECURRENCE_LABELS).map(([key, label]) => {
                  const active = recurrence === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setRecurrence(key)}
                      style={[styles.choiceBtn, active && styles.choiceBtnActive]}
                    >
                      <Text
                        style={[
                          styles.choiceBtnText,
                          active && styles.choiceBtnTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Push Notification Triggers</Text>
              <View style={styles.wrapRow}>
                <Pressable
                  onPress={() => setNotifyOnStart((prev) => !prev)}
                  style={[styles.choiceBtn, notifyOnStart && styles.choiceBtnActive]}
                >
                  <Text
                    style={[
                      styles.choiceBtnText,
                      notifyOnStart && styles.choiceBtnTextActive,
                    ]}
                  >
                    When window starts
                  </Text>
                </Pressable>
                {LEAD_DAY_OPTIONS.map((opt) => {
                  const active = notifyDaysBefore.includes(opt.value);
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => toggleLeadDay(opt.value)}
                      style={[styles.choiceBtn, active && styles.choiceBtnActive]}
                    >
                      <Text
                        style={[
                          styles.choiceBtnText,
                          active && styles.choiceBtnTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="Payment method, minimum due, or renewal instructions..."
                placeholderTextColor={COLORS.inkMuted}
                style={[styles.input, styles.textArea]}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSubmit} style={styles.saveBtn}>
              <Text style={styles.saveText}>
                {initialReminder ? 'Save Changes' : 'Save Reminder'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    gap: 16,
  },
  sectionMiniLabel: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkMuted,
    marginBottom: 6,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateBtn: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCanvas,
    justifyContent: 'center',
  },
  templateBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.roseBorder,
    backgroundColor: COLORS.roseBg,
    padding: 12,
  },
  errorText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.rose,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  subLabel: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkSecondary,
    marginBottom: 4,
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.inkPrimary,
  },
  monoInput: {
    fontFamily: FONTS.mono,
  },
  textArea: {
    minHeight: 74,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  choiceBtn: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
  },
  choiceBtnActive: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.tealBg,
  },
  choiceBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  choiceBtnTextActive: {
    color: COLORS.tealDark,
  },
  dateBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCanvas,
    padding: 14,
    gap: 12,
  },
  dateBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBoxTitle: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  spanBadge: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  cancelBtn: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  saveBtn: {
    minHeight: 44,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
