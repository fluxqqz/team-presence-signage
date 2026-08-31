import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PresenceStatus, ScheduleRule } from '../types';

const RULES_KEY = 'auto_schedule_rules';

const DEFAULT_RULES: ScheduleRule[] = [
  { id: '1', time: '09:00', action: 'restore_preset', weekdaysOnly: true, enabled: true },
  { id: '2', time: '18:00', action: 'off', weekdaysOnly: true, enabled: true },
];

export function useAutoSchedule(
  onTriggerStatus: (status: PresenceStatus) => Promise<void>,
  onRestorePreset?: () => Promise<{ success: boolean; error?: string }>,
  onSnapshotBeforeOff?: () => Promise<{ success: boolean; error?: string }>
) {
  const [rules, setRules] = useState<ScheduleRule[]>(DEFAULT_RULES);
  const [isLoading, setIsLoading] = useState(true);

  // Load rules from database or fallback to default
  const loadRules = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', RULES_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      try {
        const parsed = JSON.parse(data.value) as Array<ScheduleRule & { status?: PresenceStatus }>;
        if (Array.isArray(parsed)) {
          // ponytail: migrate legacy 'status' field to 'action' if needed
          const migrated = parsed.map((item) => ({
            id: item.id,
            time: item.time,
            action: item.action || item.status || 'hadir',
            weekdaysOnly: item.weekdaysOnly ?? true,
            enabled: item.enabled ?? true,
          }));
          setRules(migrated);
        }
      } catch {
        setRules(DEFAULT_RULES);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  // Save rules to Supabase
  const saveRules = async (newRules: ScheduleRule[]): Promise<{ success: boolean; error?: string }> => {
    setRules(newRules);
    if (!supabase) return { success: true };

    const { error } = await supabase.from('app_settings').upsert({
      key: RULES_KEY,
      value: JSON.stringify(newRules),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  // Automated trigger loop for all active rules
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const day = now.getDay();
      const isWeekday = day >= 1 && day <= 5;
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().slice(0, 10);

      rules.forEach((rule) => {
        if (!rule.enabled) return;
        if (rule.weekdaysOnly && !isWeekday) return;

        const runKey = `schedule_run_${rule.id}_${todayStr}`;
        if (currentTimeStr === rule.time && !sessionStorage.getItem(runKey)) {
          sessionStorage.setItem(runKey, 'true');

          if (rule.action === 'restore_preset') {
            if (onRestorePreset) {
              void onRestorePreset();
            }
          } else if (rule.action === 'off') {
            // Auto snapshot before turning off
            if (onSnapshotBeforeOff) {
              void onSnapshotBeforeOff().then(() => onTriggerStatus('off'));
            } else {
              void onTriggerStatus('off');
            }
          } else {
            void onTriggerStatus(rule.action);
          }
        }
      });
    }, 15000);

    return () => clearInterval(timer);
  }, [rules, onTriggerStatus, onRestorePreset, onSnapshotBeforeOff]);

  return { rules, isLoading, saveRules, reloadRules: loadRules };
}

