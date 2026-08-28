import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AutoScheduleConfig, PresenceStatus } from '../types';

const SCHEDULE_SETTINGS_KEYS = {
  enabled: 'auto_schedule_enabled',
  time: 'auto_schedule_time',
  status: 'auto_schedule_status',
  weekdaysOnly: 'auto_schedule_weekdays_only',
};

const DEFAULT_CONFIG: AutoScheduleConfig = {
  enabled: true,
  time: '18:00',
  status: 'off',
  weekdaysOnly: true,
};

export function useAutoSchedule(onTriggerReset: (status: PresenceStatus) => Promise<void>) {
  const [config, setConfig] = useState<AutoScheduleConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Load schedule configuration from database
  const loadScheduleConfig = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', Object.values(SCHEDULE_SETTINGS_KEYS));

    if (!error && data) {
      const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
      setConfig({
        enabled: map[SCHEDULE_SETTINGS_KEYS.enabled] !== undefined ? map[SCHEDULE_SETTINGS_KEYS.enabled] === 'true' : DEFAULT_CONFIG.enabled,
        time: map[SCHEDULE_SETTINGS_KEYS.time] || DEFAULT_CONFIG.time,
        status: (map[SCHEDULE_SETTINGS_KEYS.status] as PresenceStatus) || DEFAULT_CONFIG.status,
        weekdaysOnly: map[SCHEDULE_SETTINGS_KEYS.weekdaysOnly] !== undefined ? map[SCHEDULE_SETTINGS_KEYS.weekdaysOnly] === 'true' : DEFAULT_CONFIG.weekdaysOnly,
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadScheduleConfig();
  }, [loadScheduleConfig]);

  // Save updated schedule to Supabase app_settings
  const saveConfig = async (newConfig: AutoScheduleConfig): Promise<{ success: boolean; error?: string }> => {
    setConfig(newConfig);
    if (!supabase) return { success: true };

    const updates = [
      { key: SCHEDULE_SETTINGS_KEYS.enabled, value: String(newConfig.enabled), updated_at: new Date().toISOString() },
      { key: SCHEDULE_SETTINGS_KEYS.time, value: newConfig.time, updated_at: new Date().toISOString() },
      { key: SCHEDULE_SETTINGS_KEYS.status, value: newConfig.status, updated_at: new Date().toISOString() },
      { key: SCHEDULE_SETTINGS_KEYS.weekdaysOnly, value: String(newConfig.weekdaysOnly), updated_at: new Date().toISOString() },
    ];

    const { error } = await supabase.from('app_settings').upsert(updates);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  // In-app automated trigger loop (runs every 15 seconds)
  useEffect(() => {
    if (!config.enabled) return;

    const timer = setInterval(() => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const isWeekday = day >= 1 && day <= 5;

      if (config.weekdaysOnly && !isWeekday) return;

      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().slice(0, 10);

      const lastRunKey = `last_auto_schedule_run_${todayStr}`;
      const alreadyRan = sessionStorage.getItem(lastRunKey);

      if (currentTimeStr === config.time && alreadyRan !== 'triggered') {
        sessionStorage.setItem(lastRunKey, 'triggered');
        void onTriggerReset(config.status);
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [config, onTriggerReset]);

  return { config, isLoading, saveConfig, reloadConfig: loadScheduleConfig };
}
