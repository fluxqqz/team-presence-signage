import React, { useState, useEffect } from 'react';
import { TeamMember, PresenceStatus, DEPARTMENTS } from '../types';
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
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState<PresenceStatus>('present');
  const [statusNote, setStatusNote] = useState('');

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
      setRole('');
      setDepartment('Engineering');
      setAvatarUrl('');
      setStatus('present');
      setStatusNote('');
    }
  }, [editingMember, isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <UserPlus className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>{editingMember ? 'Edit Teammate' : 'Add Team Member'}</span>
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
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label htmlFor="member-role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Role / Title *
            </label>
            <input
              id="member-role"
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
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
                <option value="present">In Office</option>
                <option value="wfh">WFH</option>
                <option value="meeting">In Meeting</option>
                <option value="away">Away</option>
                <option value="leave">On Leave</option>
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
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
