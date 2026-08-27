import React, { useState, useEffect, useRef } from 'react';
import { TeamMember, PresenceStatus, DEPARTMENTS, ROLES } from '../types';
import { X, UserPlus, Save } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<TeamMember, 'id' | 'updatedAt'>) => void;
  onUpdate?: (id: string, memberData: Partial<TeamMember>) => void;
  editingMember?: TeamMember | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingMember,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Staff');
  const [department, setDepartment] = useState('Engineering');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState<PresenceStatus>('hadir');
  const [statusNote, setStatusNote] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setRole(editingMember.role);
      setDepartment(editingMember.department);
      setAvatarUrl(editingMember.avatarUrl || '');
      setStatus(editingMember.status);
      setStatusNote(editingMember.statusNote || '');
    } else {
      setName('');
      setRole('Staff');
      setDepartment('Engineering');
      setAvatarUrl('');
      setStatus('hadir');
      setStatusNote('');
    }
  }, [editingMember, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => nameInputRef.current?.focus(), 0);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    if (editingMember && onUpdate) {
      onUpdate(editingMember.id, {
        name: name.trim(),
        role: role.trim(),
        department,
        avatarUrl: avatarUrl.trim() || undefined,
        status,
        statusNote: statusNote.trim() || undefined,
      });
    } else {
      onSave({
        name: name.trim(),
        role: role.trim(),
        department,
        avatarUrl: avatarUrl.trim() || undefined,
        status,
        statusNote: statusNote.trim() || undefined,
      });
    }
    onClose();
  };

  const depts = DEPARTMENTS.filter((d) => d !== 'All');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="member-dialog-title" className="relative w-full max-w-md rounded-2xl border border-stone-300 bg-[#fbfaf7] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 font-serif text-xl text-stone-950">
            <UserPlus className="h-4 w-4 text-stone-600" aria-hidden="true" />
            <h2 id="member-dialog-title">{editingMember ? 'Edit teammate' : 'Add team member'}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="member-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              id="member-name"
              ref={nameInputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
            />
          </div>

          <div>
            <label htmlFor="member-role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Role / Level *
            </label>
            <select
              id="member-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="member-dept" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                id="member-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {depts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="member-status" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                id="member-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PresenceStatus)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="hadir">Hadir</option>
                <option value="sakit">Sakit</option>
                <option value="izin_terlambat">Izin Terlambat</option>
                <option value="cuti">Cuti</option>
                <option value="lapangan">Lapangan</option>
                <option value="wfh">WFH</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="member-avatar" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Avatar Image URL
            </label>
            <input
              id="member-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
            />
          </div>

          <div>
            <label htmlFor="member-note" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status Note
            </label>
            <input
              id="member-note"
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Desk 3B • Back after 2 PM"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{editingMember ? 'Save Changes' : 'Add Teammate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
