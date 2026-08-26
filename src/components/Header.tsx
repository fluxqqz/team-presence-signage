import React, { useEffect, useState } from 'react';
import { KeyRound, Lock, Maximize2, Minimize2, Plus, Users } from 'lucide-react';

interface HeaderProps {
  onAddMember: () => void;
  totalMembers: number;
  onChangePin: () => void;
  onLock: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddMember, totalMembers, onChangePin, onLock }) => {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => { window.clearInterval(timer); document.removeEventListener('fullscreenchange', syncFullscreen); };
  }, []);

  const toggleFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { /* Browser denied fullscreen. */ }
  };

  return <header className="sticky top-0 z-40 border-b border-stone-300/90 bg-[#f5f2eb]/95 px-4 backdrop-blur sm:px-6 lg:px-10">
    <div className="mx-auto flex min-h-[72px] max-w-[1480px] items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-900 text-[#f5f2eb]"><Users className="h-4 w-4" aria-hidden="true" /></div><div><h1 className="font-serif text-xl leading-none text-stone-950">Team presence</h1><p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500">{totalMembers} registered</p></div></div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden text-right sm:block">
          <p className="font-mono text-sm font-bold tabular-nums text-stone-900">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
          <p className="text-[11px] text-stone-500">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        </div>
        <button onClick={onAddMember} className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-stone-900 sm:px-4 sm:py-2.5 sm:text-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />Add person
        </button>
        <button onClick={onChangePin} title="Change Passcode" aria-label="Change Passcode" className="grid h-9 w-9 place-items-center rounded-full border border-stone-300 text-stone-600 transition hover:border-stone-900 hover:text-stone-950 sm:h-10 sm:w-10">
          <KeyRound className="h-4 w-4" />
        </button>
        <button onClick={onLock} title="Lock Dashboard" aria-label="Lock Dashboard" className="grid h-9 w-9 place-items-center rounded-full border border-stone-300 text-stone-600 transition hover:border-stone-900 hover:text-stone-950 sm:h-10 sm:w-10">
          <Lock className="h-4 w-4" />
        </button>
        <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className="grid h-9 w-9 place-items-center rounded-full border border-stone-300 text-stone-600 transition hover:border-stone-900 hover:text-stone-950 sm:h-10 sm:w-10">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  </header>;
};
