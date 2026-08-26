import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, X, Check } from 'lucide-react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  onClose,
  onChangePin,
}) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentPinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
      window.setTimeout(() => currentPinRef.current?.focus(), 0);
    }
  }, [isOpen]);

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
    setError(null);

    if (!currentPin || !newPin) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New passcodes do not match.');
      return;
    }

    if (newPin.length < 4) {
      setError('Passcode must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await onChangePin(currentPin, newPin);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      window.setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setError(result.error || 'Failed to update passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-pin-title"
        className="relative w-full max-w-sm rounded-2xl border border-stone-300 bg-[#fbfaf7] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 font-serif text-xl text-stone-950">
            <KeyRound className="h-4 w-4 text-stone-600" aria-hidden="true" />
            <h2 id="change-pin-title">Change Passcode</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-5 w-5" />
            </div>
            <p className="font-serif text-lg text-stone-900">Passcode updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="current-pin"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
              >
                Current Passcode
              </label>
              <input
                id="current-pin"
                ref={currentPinRef}
                type="password"
                required
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="••••"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="new-pin"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
              >
                New Passcode
              </label>
              <input
                id="new-pin"
                type="password"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-pin"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
              >
                Confirm New Passcode
              </label>
              <input
                id="confirm-pin"
                type="password"
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600">{error}</p>
            )}

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-stone-800 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Updating...' : 'Save Passcode'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
