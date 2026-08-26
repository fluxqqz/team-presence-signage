import { useState, useEffect } from 'react';
import { TeamMember, PresenceStatus } from '../types';
import { INITIAL_TEAM } from '../data/mockMembers';

const STORAGE_KEY = 'team_presence_members_v1';

export function useTeamPresence() {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load members from localStorage', e);
    }
    return INITIAL_TEAM;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members to localStorage', e);
    }
  }, [members]);

  const updateMemberStatus = (id: string, status: PresenceStatus, statusNote?: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? {
              ...member,
              status,
              statusNote: statusNote !== undefined ? statusNote : member.statusNote,
              updatedAt: new Date().toISOString(),
            }
          : member
      )
    );
  };

  const addMember = (newMember: Omit<TeamMember, 'id' | 'updatedAt'>) => {
    const created: TeamMember = {
      ...newMember,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      updatedAt: new Date().toISOString(),
    };
    setMembers((prev) => [created, ...prev]);
  };

  const editMember = (id: string, data: Partial<TeamMember>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m))
    );
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const resetToDefault = () => {
    setMembers(INITIAL_TEAM);
  };

  return {
    members,
    updateMemberStatus,
    addMember,
    editMember,
    removeMember,
    resetToDefault,
  };
}
