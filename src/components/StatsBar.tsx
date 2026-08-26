import React from 'react';
import { PresenceStatus, STATUS_CONFIG } from '../types';

interface StatsBarProps {
  statusCounts: Record<PresenceStatus, number>;
  total: number;
  activeFilter: PresenceStatus | 'all';
  onFilterChange: (status: PresenceStatus | 'all') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  statusCounts,
  total,
  activeFilter,
  onFilterChange,
}) => {
  const statuses: PresenceStatus[] = ['present', 'wfh', 'meeting', 'away', 'leave'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Card */}
      <button
        onClick={() => onFilterChange('all')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
          activeFilter === 'all'
            ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Total
        </span>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-bold text-slate-900 font-mono">{total}</span>
          <span className="text-xs text-slate-400 font-medium">100%</span>
        </div>
      </button>

      {/* Individual Status Cards */}
      {statuses.map((status) => {
        const config = STATUS_CONFIG[status];
        const count = statusCounts[status] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        const isActive = activeFilter === status;

        return (
          <button
            key={status}
            onClick={() => onFilterChange(isActive ? 'all' : status)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isActive
                ? `${config.bgClass} border-current ring-2 ring-current/20 shadow-sm`
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${config.textClass}`}>
                {config.label}
              </span>
              <span className={`w-2 h-2 rounded-full ${config.dotClass}`} aria-hidden="true" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-bold font-mono ${config.textClass}`}>{count}</span>
              <span className="text-xs text-slate-400 font-medium">{percentage}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
