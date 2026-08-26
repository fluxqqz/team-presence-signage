import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Plus, Users } from 'lucide-react';

interface HeaderProps {
  onAddMember: () => void;
  totalMembers: number;
}

export const Header: React.FC<HeaderProps> = ({ onAddMember, totalMembers }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40 px-6 py-3.5 shadow-sm">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Users className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Team Presence
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {totalMembers} team members registered
            </p>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-lg shadow-inner">
          <span className="text-xl font-mono font-bold tracking-widest text-slate-800">
            {formattedTime}
          </span>
          <span className="text-xs text-slate-500 font-medium border-l border-slate-200 pl-3">
            {formattedDate}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Member</span>
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter TV Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter TV Fullscreen'}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
