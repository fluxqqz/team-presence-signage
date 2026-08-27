import React from 'react';
import { PresenceStatus, STATUS_CONFIG } from '../types';

interface StatsBarProps {
  statusCounts: Record<PresenceStatus, number>;
  total: number;
  activeFilter: PresenceStatus | 'all';
  onFilterChange: (status: PresenceStatus | 'all') => void;
  activeDept?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ statusCounts, total, activeFilter, onFilterChange, activeDept = 'All' }) => {
  const statuses: PresenceStatus[] = ['hadir', 'sakit', 'izin_terlambat', 'cuti', 'lapangan', 'wfh', 'off'];
  const title = activeDept === 'All' ? 'Today at a glance' : `${activeDept} at a glance`;
  return <section className="rounded-2xl border border-stone-300 bg-stone-900 p-5 text-[#f8f5ef] shadow-[0_12px_32px_rgba(65,55,40,0.12)]" aria-label="Presence summary">
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">{title}</p>
    <button onClick={() => onFilterChange('all')} className="mt-3 flex w-full items-end justify-between border-b border-stone-700 pb-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><span className="font-serif text-4xl leading-none">{total}</span><span className="text-sm font-semibold text-stone-300">Total people</span></button>
    <div className="mt-3 space-y-1">{statuses.map((status) => { const config = STATUS_CONFIG[status]; const count = statusCounts[status]; const active = activeFilter === status; return <button key={status} onClick={() => onFilterChange(active ? 'all' : status)} aria-pressed={active} className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}><span className="flex items-center gap-2.5 text-sm text-stone-200"><span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} aria-hidden="true" />{config.label}</span><span className="font-mono text-sm font-bold text-white">{count}</span></button>; })}</div>
  </section>;
};
