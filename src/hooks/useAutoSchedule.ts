import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PresenceStatus, ScheduleRule } from '../types';
import { getDueScheduleRuns, getScheduleRunKey, runScheduleActions } from './scheduleTiming';

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
  const isCheckingRef = useRef(false);

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

    const checkSchedules = async () => {
      const previousCheck = previousCheckRef.current;
      if (!previousCheck || isCheckingRef.current) return;

      isCheckingRef.current = true;
      try {
        const now = new Date();
        const pendingRules: ScheduleRule[] = [];

        for (const { rule, dueAt } of getDueScheduleRuns(rules, previousCheck, now)) {
          const runKey = getScheduleRunKey(rule, dueAt);
          if (sessionStorage.getItem(runKey)) continue;

          sessionStorage.setItem(runKey, 'true');
          pendingRules.push(rule);
        }

        previousCheckRef.current = now;
        await runScheduleActions(pendingRules, {
          onTriggerStatus,
          onRestorePreset,
          onSnapshotBeforeOff,
        });
      } finally {
        isCheckingRef.current = false;
      }
    };

    void checkSchedules();
    const timer = setInterval(() => void checkSchedules(), 15000);
    return () => clearInterval(timer);
  }, [isLoading, rules, onTriggerStatus, onRestorePreset, onSnapshotBeforeOff]);

  return { rules, isLoading, saveRules, reloadRules: loadRules };
}

