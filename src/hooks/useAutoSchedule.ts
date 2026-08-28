import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AutoScheduleConfig, PresenceStatus } from '../types';

const SCHEDULE_SETTINGS_KEYS = {
  enabled: 'auto_schedule_enabled',
  morningTime: 'auto_morning_time',
  morningStatus: 'auto_morning_status',
  eveningTime: 'auto_evening_time',
  eveningStatus: 'auto_evening_status',
  weekdaysOnly: 'auto_schedule_weekdays_only',
  lastRunDate: 'auto_schedule_last_run_date',
  lastRunSlot: 'auto_schedule_last_run_slot',
};

const DEFAULT_CONFIG: AutoScheduleConfig = {
  enabled: true,
  morningTime: '09:00',
  morningStatus: 'hadir',
  eveningTime: '18:00',
  eveningStatus: 'off',
  weekdaysOnly: true,
};

export function useAutoSchedule(onTriggerReset: (status: PresenceStatus) => Promise<void>) {
  const [config, setConfig] = useState<AutoScheduleConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Load schedule configuration from database or local storage
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
        morningTime: map[SCHEDULE_SETTINGS_KEYS.morningTime] || DEFAULT_CONFIG.morningTime,
        morningStatus: (map[SCHEDULE_SETTINGS_KEYS.morningStatus] as PresenceStatus) || DEFAULT_CONFIG.morningStatus,
        eveningTime: map[SCHEDULE_SETTINGS_KEYS.eveningTime] || DEFAULT_CONFIG.eveningTime,
        eveningStatus: (map[SCHEDULE_SETTINGS_KEYS.eveningStatus] as PresenceStatus) || DEFAULT_CONFIG.eveningStatus,
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
      { key: SCHEDULE_SETTINGS_KEYS.morningTime, value: newConfig.morningTime, updated_at: new Date().toISOString() },
      { key: SCHEDULE_SETTINGS_KEYS.morningStatus, value: newConfig.morningStatus, updated_at: new Date().toISOString() },
      { key: SCHEDULE_SETTINGS_KEYS.eveningTime, value: newConfig.eveningTime, updated_at: new Date().toISOString() },
      { key: SCHEDULE_SETTINGS_KEYS.eveningStatus, value: newConfig.eveningStatus, updated_at: new Date().toISOString() },
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

      // Check morning trigger
      if (currentTimeStr === config.morningTime && alreadyRan !== 'morning') {
        sessionStorage.setItem(lastRunKey, 'morning');
        void onTriggerReset(config.morningStatus);
      }
      // Check evening trigger
      else if (currentTimeStr === config.eveningTime && alreadyRan !== 'evening') {
        sessionStorage.setItem(lastRunKey, 'evening');
        void onTriggerReset(config.eveningStatus);
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [config, onTriggerReset]);

  return { config, isLoading, saveConfig, reloadConfig: loadScheduleConfig };
}
