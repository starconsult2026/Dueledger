import React from 'react';
import { Calendar, Download, ExternalLink, FileCode2, RotateCcw, Trash2 } from 'lucide-react';
import { downloadIcsFile } from '../utils/calendarExport';
import { PWAInstallButton } from './PWAInstallButton';

const LEAD_OPTIONS = [
  { day: 7, label: '7 days before' },
  { day: 3, label: '3 days before' },
  { day: 1, label: '1 day before' },
  { day: 0, label: 'Due day' },
];

export const SettingsView = ({
  settings,
  reminders,
  onUpdateSettings,
  onResetDemoData,
  onClearAllReminders,
}) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const host = typeof window !== 'undefined' ? window.location.host : 'dueledger.app';
  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(origin)}`;

  const handleDownloadTwaManifest = () => {
    const twaManifest = {
      packageId: 'app.dueledger.reminders',
      host,
      name: 'DueLedger',
      launcherName: 'DueLedger',
      display: 'standalone',
      themeColor: '#0F766E',
      themeColorDark: '#0F766E',
      navigationColor: '#F8FAFC',
      navigationColorDark: '#0F172A',
      navigationDividerColor: '#E2E8F0',
      backgroundColor: '#F8FAFC',
      enableNotifications: true,
      startUrl: '/',
      iconUrl: `${origin}/pwa-512x512.png`,
      maskableIconUrl: `${origin}/pwa-maskable-512x512.png`,
      splashScreenFadeOutDuration: 300,
      appVersionName: '1.0.0',
      appVersionCode: 1,
      shortcuts: [],
      fallbackType: 'customtabs',
      enableSiteSettingsShortcut: 'true',
      isChromeOSOnly: false,
      webManifestUrl: `${origin}/manifest.webmanifest`,
    };

    const blob = new Blob([JSON.stringify(twaManifest, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'twa-manifest.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleDefaultLead = (day) => {
    const exists = settings.defaultLeadDays.includes(day);
    const next = exists
      ? settings.defaultLeadDays.filter((d) => d !== day)
      : [...settings.defaultLeadDays, day].sort((a, b) => b - a);
    onUpdateSettings({ ...settings, defaultLeadDays: next });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 font-display">
            Android App & APK Packaging
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Install directly on Android Chrome as a standalone WebAPK, or generate a downloadable signed .apk package via PWABuilder or Bubblewrap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PWAInstallButton variant="card" />

          <a
            href={pwabuilderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 whitespace-nowrap"
          >
            <span>Package APK via PWABuilder</span>
            <ExternalLink className="h-4 w-4 text-slate-500" />
          </a>

          <button
            type="button"
            onClick={handleDownloadTwaManifest}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 whitespace-nowrap"
          >
            <FileCode2 className="h-4 w-4 text-teal-700" />
            <span>Download twa-manifest.json</span>
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 font-display">
            Google Calendar Export & Backup
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Download all {reminders.length} reminders as a standard .ics calendar file with built-in date-range alarms to import into Google Calendar.
          </p>
        </div>

        <button
          type="button"
          disabled={reminders.length === 0}
          onClick={() => downloadIcsFile(reminders, 'dueledger-all-reminders.ics')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Calendar className="h-4 w-4" />
          <span>Export All Reminders (.ics)</span>
          <Download className="h-4 w-4" />
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 font-display">
          Reminder Defaults
        </h2>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Default Currency
          </label>
          <select
            value={settings.defaultCurrency}
            onChange={(e) =>
              onUpdateSettings({ ...settings, defaultCurrency: e.target.value })
            }
            className="mt-1 min-h-[44px] w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
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
          <p className="text-xs font-medium text-slate-700">
            Default Push Notification Lead Times
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LEAD_OPTIONS.map((opt) => {
              const active = settings.defaultLeadDays.includes(opt.day);
              return (
                <button
                  key={opt.day}
                  type="button"
                  onClick={() => toggleDefaultLead(opt.day)}
                  className={`min-h-[40px] rounded-xl border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
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
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 font-display">
            Local Device Storage
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Reminders are stored privately on your device using IndexedDB so they remain available offline.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Restore Sample Reminders
          </button>

          <button
            type="button"
            onClick={onClearAllReminders}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Reminders
          </button>
        </div>
      </section>
    </div>
  );
};
