import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

const PIN_KEY = 'admin_pin';
const DEFAULT_PIN = '1234';
const SESSION_STORAGE_KEY = 'admin_authenticated';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRemotePin = useCallback(async (): Promise<string> => {
    if (!supabase) return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', PIN_KEY)
      .maybeSingle();

    if (error || !data) {
      // ponytail: fallback to local/default if app_settings row doesn't exist yet
      return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
    }
    return data.value;
  }, []);

  const login = async (enteredPin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const correctPin = await getRemotePin();
      if (enteredPin.trim() === correctPin.trim()) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
      setError('Incorrect passcode. Try again.');
      setIsLoading(false);
      return false;
    } catch {
      setError('Authentication failed. Check your connection.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  const changePin = async (currentPin: string, newPin: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPin.trim()) {
      return { success: false, error: 'New PIN cannot be empty.' };
    }
    setIsLoading(true);
    try {
      const correctPin = await getRemotePin();
      if (currentPin.trim() !== correctPin.trim()) {
        setIsLoading(false);
        return { success: false, error: 'Current passcode is incorrect.' };
      }

      if (supabase) {
        const { error: upsertError } = await supabase
          .from('app_settings')
          .upsert({ key: PIN_KEY, value: newPin.trim(), updated_at: new Date().toISOString() });

        if (upsertError) {
          setIsLoading(false);
          return { success: false, error: upsertError.message };
        }
      }

      localStorage.setItem(PIN_KEY, newPin.trim());
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Failed to update passcode.' };
    }
  };

  return { isAuthenticated, isLoading, error, login, logout, changePin, setError };
}
