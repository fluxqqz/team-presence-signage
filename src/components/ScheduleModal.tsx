import React, { useEffect, useState } from 'react';
import { Clock, Plus, Save, Trash2, X } from 'lucide-react';
import { PresenceStatus, STATUS_CONFIG, ScheduleAction, ScheduleRule } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: ScheduleRule[];
  onSave: (rules: ScheduleRule[]) => Promise<{ success: boolean; error?: string }>;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  rules: initialRules,
  onSave,
}) => {
  const [rules, setRules] = useState<ScheduleRule[]>(initialRules);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRules(
        initialRules.length > 0
          ? initialRules
          : [
              { id: '1', time: '09:00', action: 'restore_preset', weekdaysOnly: true, enabled: true },
              { id: '2', time: '18:00', action: 'off', weekdaysOnly: true, enabled: true },
            ]
      );
      setErrorMessage(null);
    }
  }, [initialRules, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddRule = () => {
    const newRule: ScheduleRule = {
      id: String(Date.now()),
      time: '12:00',
      action: 'hadir',
      weekdaysOnly: true,
      enabled: true,
    };
    setRules((prev) => [...prev, newRule]);
  };

  const handleRemoveRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRule = (id: string, updates: Partial<ScheduleRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const result = await onSave(rules);
    setIsSaving(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to save schedules.');
    }
  };

  const statuses = Object.keys(STATUS_CONFIG) as PresenceStatus[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-dialog-title"
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-stone-300 bg-[#fbfaf7] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-stone-900 text-white">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="schedule-dialog-title" className="font-serif text-xl font-bold text-stone-950">
                Automated Schedules
              </h2>
              <p className="text-xs text-stone-500">Auto-reset or restore team statuses at set times</p>
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
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {rules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-300 bg-white/60 p-8 text-center text-stone-500">
                <p className="text-sm font-semibold">No schedule rules added yet.</p>
                <p className="mt-1 text-xs">Click "+ Add Another Schedule" below to create one.</p>
              </div>
            ) : (
              rules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className={`rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm transition ${
                    rule.enabled ? 'opacity-100' : 'bg-stone-50 opacity-60'
                  }`}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Schedule #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => handleUpdateRule(rule.id, { enabled: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-5 w-9 rounded-full bg-stone-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-stone-900 peer-checked:after:translate-x-full peer-focus:outline-none" />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule.id)}
                        className="rounded-full p-1 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Delete schedule"
                        aria-label="Delete schedule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Trigger Time
                      </label>
                      <input
                        type="time"
                        value={rule.time}
                        onChange={(e) => handleUpdateRule(rule.id, { time: e.target.value })}
                        required
                        className="w-full rounded-lg border border-stone-300 bg-[#fbfaf7] px-2.5 py-1.5 font-mono text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Action
                      </label>
                      <select
                        value={rule.action}
                        onChange={(e) => handleUpdateRule(rule.id, { action: e.target.value as ScheduleAction })}
                        className="w-full rounded-lg border border-stone-300 bg-[#fbfaf7] px-2.5 py-1.5 text-xs font-bold text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                      >
                        <option value="restore_preset">🔄 Restore Saved Preset</option>
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            Set All to: {STATUS_CONFIG[s].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2">
                    <span className="text-xs font-medium text-stone-600">Weekdays Only (Mon-Fri)</span>
                    <input
                      type="checkbox"
                      checked={rule.weekdaysOnly}
                      onChange={(e) => handleUpdateRule(rule.id, { weekdaysOnly: e.target.checked })}
                      className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={handleAddRule}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 py-2.5 text-xs font-bold text-stone-700 transition hover:border-stone-900 hover:bg-stone-50 hover:text-stone-950"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Another Schedule</span>
          </button>

          <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-stone-200 pt-4">
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
              <span>{isSaving ? 'Saving...' : 'Save Schedules'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

