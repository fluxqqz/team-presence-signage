import React, { useState } from 'react';
import { TeamMember, PresenceStatus, STATUS_CONFIG } from '../types';
import { StatusBadge } from './StatusBadge';
import { Clock, MessageSquare, Check, Edit2, Trash2 } from 'lucide-react';

interface MemberCardProps {
  member: TeamMember;
  onUpdateStatus: (id: string, status: PresenceStatus, note?: string) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onUpdateStatus,
  onEdit,
  onDelete,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(member.statusNote || '');

  const config = STATUS_CONFIG[member.status];

  const handleSaveNote = () => {
    onUpdateStatus(member.id, member.status, noteText);
    setIsEditingNote(false);
  };

  const timeAgo = (isoDate: string) => {
    try {
      const diffMinutes = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all p-3.5 flex flex-col justify-between bg-white shadow-sm hover:shadow-md ${
        member.status === 'present'
          ? 'border-emerald-200 hover:border-emerald-300'
          : member.status === 'meeting'
          ? 'border-amber-200 hover:border-amber-300'
          : member.status === 'wfh'
          ? 'border-sky-200 hover:border-sky-300'
          : member.status === 'away'
          ? 'border-purple-200 hover:border-purple-300'
          : 'border-rose-200 hover:border-rose-300'
      }`}
    >
      <div>
        {/* Top: Compact Avatar, Name, Department, Actions */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {member.name.charAt(0)}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${config.dotClass}`}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">
                {member.name}
              </h3>
              <p className="text-[11px] text-slate-500 truncate leading-snug">{member.role}</p>
              <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 border border-slate-200">
                {member.department}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => onEdit(member)}
              aria-label={`Edit ${member.name}`}
              title="Edit Member"
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => onDelete(member.id)}
              aria-label={`Delete ${member.name}`}
              title="Remove Member"
              className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Current status display & last update */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <StatusBadge status={member.status} />
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {timeAgo(member.updatedAt)}
          </span>
        </div>

        {/* 1-Click Status Bar */}
        <div className="mt-2 grid grid-cols-5 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          {(['present', 'wfh', 'meeting', 'away', 'leave'] as PresenceStatus[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            const isSelected = member.status === st;
            return (
              <button
                key={st}
                onClick={() => onUpdateStatus(member.id, st)}
                title={cfg.label}
                className={`py-1 rounded text-[9px] font-bold flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  isSelected
                    ? `${cfg.bgClass} ${cfg.textClass} border ${cfg.borderClass} shadow-xs font-bold`
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${cfg.dotClass}`} aria-hidden="true" />
                <span className="truncate max-w-[36px]">{cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Note / Activity text */}
        <div className="mt-2.5">
          {isEditingNote ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Status note (e.g. Back at 2 PM)"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNote();
                  if (e.key === 'Escape') setIsEditingNote(false);
                }}
                className="w-full bg-slate-50 text-xs text-slate-900 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveNote}
                aria-label="Save note"
                className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
              >
                <Check className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNoteText(member.statusNote || '');
                setIsEditingNote(true);
              }}
              className="w-full text-left flex items-start gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors py-0.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">
                {member.statusNote || 'Add note...'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
