import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface PinLockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  onUnlock,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || isLoading) return;
    await onUnlock(pin);
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-stone-900 flex flex-col items-center justify-center p-4 antialiased selection:bg-stone-900 selection:text-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-900 text-[#f5f2eb] shadow-lg">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-1">
            Arthatronic Signage
          </p>
          <h1 className="font-serif text-3xl tracking-tight text-stone-950">
            Admin Access
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Enter the admin passcode to access the team presence dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-300 bg-[#fbfaf7] p-6 shadow-[0_12px_32px_rgba(65,55,40,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="passcode"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2"
              >
                Passcode
              </label>
              <input
                id="passcode"
                type="password"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMessage) onClearError();
                }}
                placeholder="••••"
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-xl tracking-[0.3em] font-mono text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 placeholder:text-stone-300"
              />
            </div>

            {errorMessage && (
              <p className="text-center text-xs font-semibold text-rose-600">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Unlock Dashboard</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-stone-200 pt-4 flex items-center justify-center gap-1.5 text-xs text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Default passcode: 1234</span>
          </div>
        </div>
      </div>
    </div>
  );
};
