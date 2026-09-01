import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PresenceStatus, ScheduleRule } from '../types';
import { getScheduleDueAt } from './scheduleTiming';

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
  const previousCheckRef = useRef<Date | null>(null);

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

  // Check immediately, then catch rules whose scheduled minute passes between timer ticks.
  useEffect(() => {
    if (isLoading) return;
    if (!previousCheckRef.current) {
      const currentMinute = new Date();
      currentMinute.setSeconds(0, 0);
      previousCheckRef.current = new Date(currentMinute.getTime() - 1);
    }

    const checkSchedules = () => {
      const previousCheck = previousCheckRef.current;
      if (!previousCheck) return;
      const now = new Date();

      rules.forEach((rule) => {
        const dueAt = getScheduleDueAt(rule, previousCheck, now);
        if (!dueAt) return;

        const runDate = `${dueAt.getFullYear()}-${String(dueAt.getMonth() + 1).padStart(2, '0')}-${String(dueAt.getDate()).padStart(2, '0')}`;
        const runKey = `schedule_run_${rule.id}_${runDate}`;
        if (sessionStorage.getItem(runKey)) return;
        sessionStorage.setItem(runKey, 'true');

        if (rule.action === 'restore_preset') {
          if (onRestorePreset) {
            void onRestorePreset();
          }
        } else if (rule.action === 'off') {
          if (onSnapshotBeforeOff) {
            void onSnapshotBeforeOff().then(() => onTriggerStatus('off'));
          } else {
            void onTriggerStatus('off');
          }
        } else {
          void onTriggerStatus(rule.action);
        }
      });

      previousCheckRef.current = now;
    };

    checkSchedules();
    const timer = setInterval(checkSchedules, 15000);
    return () => clearInterval(timer);
  }, [isLoading, rules, onTriggerStatus, onRestorePreset, onSnapshotBeforeOff]);

  return { rules, isLoading, saveRules, reloadRules: loadRules };
}

