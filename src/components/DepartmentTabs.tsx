import React from 'react';
import { DEPARTMENTS } from '../types';

interface DepartmentTabsProps { activeDept: string; onSelectDept: (dept: string) => void; departmentCounts: Record<string, number>; }

export const DepartmentTabs: React.FC<DepartmentTabsProps> = ({ activeDept, onSelectDept, departmentCounts }) => <div className="space-y-1">{DEPARTMENTS.map((department) => { const active = activeDept === department; return <button key={department} onClick={() => onSelectDept(department)} aria-pressed={active} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${active ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`}><span className="font-semibold">{department}</span><span className={`font-mono text-xs ${active ? 'text-stone-300' : 'text-stone-400'}`}>{departmentCounts[department] ?? 0}</span></button>; })}</div>;
