import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Clock, Edit2, MessageSquare, Trash2 } from 'lucide-react';
import { PresenceStatus, STATUS_CONFIG, TeamMember } from '../types';

interface MemberCardProps { member: TeamMember; onUpdateStatus: (id: string, status: PresenceStatus, note?: string) => void; onEdit: (member: TeamMember) => void; onDelete: (id: string) => void; }

const timeAgo = (isoDate: string) => { const minutes = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000)); if (minutes < 1) return 'Just now'; if (minutes < 60) return `${minutes}m ago`; const hours = Math.floor(minutes / 60); return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`; };
const statusColorBg: Record<PresenceStatus, string> = {
  hadir: 'bg-[#FFF9FF]',
  sakit: 'bg-[#FF080B]',
  izin_terlambat: 'bg-[#FFFB01]',
  cuti: 'bg-[#F243FF]',
  lapangan: 'bg-[#0CF2FF]',
  wfh: 'bg-[#0EFF12]',
  off: 'bg-stone-400',
};

export const MemberCard: React.FC<MemberCardProps> = ({ member, onUpdateStatus, onEdit, onDelete }) => {
  const [editingNote, setEditingNote] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [note, setNote] = useState(member.statusNote || '');
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const config = STATUS_CONFIG[member.status];

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!statusMenuRef.current?.contains(event.target as Node)) setStatusMenuOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);
  const saveNote = () => { onUpdateStatus(member.id, member.status, note); setEditingNote(false); };
  const remove = () => { if (window.confirm(`Remove ${member.name} from the directory?`)) onDelete(member.id); };

  return <article className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 border-b border-stone-200 px-5 py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_150px_110px]">
    <div className="min-w-0"><div className="flex items-center gap-3"><div className={`shrink-0 rounded-full p-[3px] border border-stone-400/80 ${statusColorBg[member.status]}`}>{member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-10 w-10 rounded-full border border-stone-200/60 bg-stone-100 object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-stone-200 font-serif text-lg text-stone-700">{member.name.charAt(0)}</div>}</div><div className="min-w-0"><h3 className="truncate font-serif text-xl leading-tight text-stone-950">{member.name}</h3><p className="mt-0.5 truncate text-sm text-stone-500">{member.role} <span className="text-stone-300">/</span> {member.department}</p></div></div>{editingNote ? <div className="mt-3 flex gap-2"><input autoFocus value={note} onChange={(event) => setNote(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveNote(); if (event.key === 'Escape') setEditingNote(false); }} placeholder="Add availability context" className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" /><button onClick={saveNote} aria-label="Save note" className="grid h-9 w-9 place-items-center rounded-md bg-stone-900 text-white"><Check className="h-4 w-4" /></button></div> : <button onClick={() => { setNote(member.statusNote || ''); setEditingNote(true); }} className="mt-2 flex max-w-full items-center gap-1.5 text-left text-sm text-stone-500 transition hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"><MessageSquare className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{member.statusNote || 'Add availability context'}</span></button>}</div>
    <div className="relative hidden sm:block" ref={statusMenuRef}><button type="button" onClick={() => setStatusMenuOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'Escape') setStatusMenuOpen(false); }} aria-label={`Update status for ${member.name}`} aria-expanded={statusMenuOpen} className={`flex w-full items-center justify-between rounded-md border border-stone-300 bg-white px-2 py-2 text-xs font-bold outline-none transition hover:border-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 ${config.textClass}`}><span>{config.label}</span><ChevronDown className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" /></button>{statusMenuOpen && <div role="menu" className="absolute left-0 top-[calc(100%+0.375rem)] z-20 w-full overflow-hidden rounded-md border border-stone-200 bg-white py-1 shadow-lg">{(Object.keys(STATUS_CONFIG) as PresenceStatus[]).map((status) => { const option = STATUS_CONFIG[status]; return <button key={status} type="button" role="menuitem" onClick={() => { onUpdateStatus(member.id, status); setStatusMenuOpen(false); }} className={`block w-full px-2.5 py-2 text-left text-xs font-bold transition hover:bg-stone-50 ${option.textClass}`}>{option.label}</button>; })}</div>}</div>
    <div className="flex items-center justify-end gap-1.5"><span className="hidden items-center gap-1 font-mono text-[11px] text-stone-400 md:flex"><Clock className="h-3 w-3" />{timeAgo(member.updatedAt)}</span><button onClick={() => onEdit(member)} aria-label={`Edit ${member.name}`} className="grid h-9 w-9 place-items-center rounded-full text-stone-500 transition hover:bg-stone-200 hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"><Edit2 className="h-4 w-4" /></button><button onClick={remove} aria-label={`Remove ${member.name}`} className="grid h-9 w-9 place-items-center rounded-full text-stone-400 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"><Trash2 className="h-4 w-4" /></button></div>
  </article>;
};
