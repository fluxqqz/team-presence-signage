import React, { useEffect, useState } from 'react';
import { Clock, Save, X } from 'lucide-react';
import { AutoScheduleConfig, PresenceStatus, STATUS_CONFIG } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AutoScheduleConfig;
  onSave: (config: AutoScheduleConfig) => Promise<{ success: boolean; error?: string }>;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [time, setTime] = useState(config.time || '18:00');
  const [status, setStatus] = useState<PresenceStatus>(config.status || 'off');
  const [weekdaysOnly, setWeekdaysOnly] = useState(config.weekdaysOnly ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEnabled(config.enabled);
      setTime(config.time || '18:00');
      setStatus(config.status || 'off');
      setWeekdaysOnly(config.weekdaysOnly ?? true);
      setErrorMessage(null);
    }
  }, [config, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const result = await onSave({
      enabled,
      time,
      status,
      weekdaysOnly,
    });

    setIsSaving(false);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to save schedule settings.');
    }
  };

  const statuses = Object.keys(STATUS_CONFIG) as PresenceStatus[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-stone-300 bg-[#fbfaf7] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-stone-900 text-white">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="schedule-dialog-title" className="font-serif text-xl font-bold text-stone-950">
                Automated Schedule
              </h2>
              <p className="text-xs text-stone-500">Auto-reset all statuses at a custom time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm">
            <div>
              <p className="text-sm font-bold text-stone-900">Enable Schedule</p>
              <p className="text-xs text-stone-500">Automatically switch statuses at set time</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-stone-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-stone-900 peer-checked:after:translate-x-full peer-focus:outline-none" />
            </label>
          </div>

          <div className={`space-y-4 transition-opacity ${enabled ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
            {/* Custom Rule Card */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="schedule-time" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Trigger Time
                  </label>
                  <input
                    id="schedule-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required={enabled}
                    className="w-full rounded-lg border border-stone-300 bg-[#fbfaf7] px-3 py-2 text-sm font-mono font-bold text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                  />
                </div>
                <div>
                  <label htmlFor="schedule-status" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Set All To
                  </label>
                  <select
                    id="schedule-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PresenceStatus)}
                    className="w-full rounded-lg border border-stone-300 bg-[#fbfaf7] px-3 py-2 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Weekdays Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm">
              <div>
                <p className="text-sm font-bold text-stone-900">Weekdays Only</p>
                <p className="text-xs text-stone-500">Runs Monday to Friday only</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={weekdaysOnly}
                  onChange={(e) => setWeekdaysOnly(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-stone-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-stone-900 peer-checked:after:translate-x-full peer-focus:outline-none" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-stone-700 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
