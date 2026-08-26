import React from 'react';
import { DEPARTMENTS } from '../types';

interface DepartmentTabsProps {
  activeDept: string;
  onSelectDept: (dept: string) => void;
  departmentCounts: Record<string, number>;
}

export const DepartmentTabs: React.FC<DepartmentTabsProps> = ({
  activeDept,
  onSelectDept,
  departmentCounts,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {DEPARTMENTS.map((dept) => {
        const isActive = activeDept === dept;
        const count = departmentCounts[dept] ?? 0;

        return (
          <button
            key={dept}
            onClick={() => onSelectDept(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
            }`}
          >
            <span>{dept}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
