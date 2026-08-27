import { useCallback, useEffect, useState } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { PresenceStatus, TeamMember } from '../types';
import { supabase } from '../lib/supabase';

type TeamMemberRow = {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar_url: string | null;
  status: PresenceStatus;
  status_note: string | null;
  updated_at: string;
};

const fromRow = (row: TeamMemberRow): TeamMember => ({
  id: row.id,
  name: row.name,
  role: row.role,
  department: row.department,
  avatarUrl: row.avatar_url || undefined,
  status: row.status,
  statusNote: row.status_note || undefined,
  updatedAt: row.updated_at,
});

export function useTeamPresence() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured. Check local.env and restart the dev server.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error: loadError } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (loadError) {
      setError(loadError.message);
    } else {
      setMembers((data as TeamMemberRow[]).map(fromRow));
      setError(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadMembers();
    if (!supabase) return;

    const client = supabase;
    const channel = client
      .channel('team-members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_members' },
        (payload: RealtimePostgresChangesPayload<TeamMemberRow>) => {
          if (payload.eventType === 'DELETE') {
            setMembers((current) => current.filter((member) => member.id !== payload.old.id));
            return;
          }

          const member = fromRow(payload.new);
          setMembers((current) => {
            const exists = current.some((item) => item.id === member.id);
            const next = exists
              ? current.map((item) => (item.id === member.id ? member : item))
              : [...current, member];
            return next.sort((a, b) => a.name.localeCompare(b.name));
          });
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [loadMembers]);

  const updateMemberStatus = async (id: string, status: PresenceStatus, statusNote?: string) => {
    if (!supabase) return;
    const previous = members.find((member) => member.id === id);
    const updatedAt = new Date().toISOString();
    const changes: Pick<TeamMemberRow, 'status'> & Partial<Pick<TeamMemberRow, 'status_note'>> = { status };
    if (statusNote !== undefined) changes.status_note = statusNote || null;

    setMembers((current) => current.map((member) => member.id === id
      ? { ...member, status, ...(statusNote !== undefined && { statusNote: statusNote || undefined }), updatedAt }
      : member));

    const { error: updateError } = await supabase.from('team_members').update(changes).eq('id', id);
    if (updateError) {
      if (previous) setMembers((current) => current.map((member) => member.id === id ? previous : member));
      setError(updateError.message);
    } else {
      setError(null);
    }
  };

  const addMember = async (member: Omit<TeamMember, 'id' | 'updatedAt'>) => {
    if (!supabase) return;
    const { error: insertError } = await supabase.from('team_members').insert({
      name: member.name,
      role: member.role,
      department: member.department,
      avatar_url: member.avatarUrl || null,
      status: member.status,
      status_note: member.statusNote || null,
    });
    if (insertError) setError(insertError.message);
  };

  const editMember = async (id: string, member: Partial<TeamMember>) => {
    if (!supabase) return;
    const changes = {
      ...(member.name !== undefined && { name: member.name }),
      ...(member.role !== undefined && { role: member.role }),
      ...(member.department !== undefined && { department: member.department }),
      ...(member.avatarUrl !== undefined && { avatar_url: member.avatarUrl || null }),
      ...(member.status !== undefined && { status: member.status }),
      ...(member.statusNote !== undefined && { status_note: member.statusNote || null }),
    };
    const { error: updateError } = await supabase.from('team_members').update(changes).eq('id', id);
    if (updateError) setError(updateError.message);
  };

  const removeMember = async (id: string) => {
    if (!supabase) return;
    const { error: deleteError } = await supabase.from('team_members').delete().eq('id', id);
    if (deleteError) setError(deleteError.message);
  };

  const updateAllStatus = async (status: PresenceStatus) => {
    if (!supabase) return;
    const previous = [...members];
    const updatedAt = new Date().toISOString();

    setMembers((current) => current.map((member) => ({ ...member, status, updatedAt })));

    const { error: updateError } = await supabase
      .from('team_members')
      .update({ status })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (updateError) {
      setMembers(previous);
      setError(updateError.message);
    } else {
      setError(null);
    }
  };

  return { members, isLoading, error, updateMemberStatus, updateAllStatus, addMember, editMember, removeMember };
}
