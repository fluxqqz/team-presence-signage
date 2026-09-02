import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PresenceStatus, ScheduleRule } from '../types';

const RULES_KEY = 'auto_schedule_rules';

const DEFAULT_RULES: ScheduleRule[] = [
  { id: '1', time: '09:00', action: 'restore_preset', weekdaysOnly: true, enabled: true },
  { id: '2', time: '18:00', action: 'off', weekdaysOnly: true, enabled: true },
];

export function useAutoSchedule() {
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
    if (!supabase) {
      setRules(newRules);
      return { success: true };
    }

    const { error } = await supabase.from('app_settings').upsert({
      key: RULES_KEY,
      value: JSON.stringify(newRules),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }
    setRules(newRules);
    return { success: true };
  };

  return { rules, isLoading, saveRules, reloadRules: loadRules };
}

