import { useState, useMemo } from 'react';
import { useTeamPresence } from './hooks/useTeamPresence';
import { PresenceStatus, TeamMember } from './types';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { DepartmentTabs } from './components/DepartmentTabs';
import { MemberCard } from './components/MemberCard';
import { MemberModal } from './components/MemberModal';
import { Search, RotateCcw } from 'lucide-react';

export function App() {
  const {
    members,
    updateMemberStatus,
    addMember,
    editMember,
    removeMember,
    resetToDefault,
  } = useTeamPresence();

  const [activeStatusFilter, setActiveStatusFilter] = useState<PresenceStatus | 'all'>('all');
  const [activeDept, setActiveDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const statusCounts = useMemo(() => {
    const counts: Record<PresenceStatus, number> = {
      present: 0,
      wfh: 0,
      meeting: 0,
      away: 0,
      leave: 0,
    };
    members.forEach((m) => {
      if (counts[m.status] !== undefined) {
        counts[m.status]++;
      }
    });
    return counts;
  }, [members]);

  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { All: members.length };
    members.forEach((m) => {
      counts[m.department] = (counts[m.department] || 0) + 1;
    });
    return counts;
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchStatus =
        activeStatusFilter === 'all' || member.status === activeStatusFilter;
      const matchDept = activeDept === 'All' || member.department === activeDept;
      const matchSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.statusNote &&
          member.statusNote.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStatus && matchDept && matchSearch;
    });
  }, [members, activeStatusFilter, activeDept, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      <Header onAddMember={handleOpenAddModal} totalMembers={members.length} />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Presence Summary */}
        <section aria-label="Presence Summary">
          <StatsBar
            statusCounts={statusCounts}
            total={members.length}
            activeFilter={activeStatusFilter}
            onFilterChange={setActiveStatusFilter}
          />
        </section>

        {/* Filter Controls & Search */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <DepartmentTabs
            activeDept={activeDept}
            onSelectDept={setActiveDept}
            departmentCounts={departmentCounts}
          />

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search member or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <button
              onClick={resetToDefault}
              aria-label="Reset to default team"
              title="Reset to default team"
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Team Members Grid */}
        <section aria-label="Team Roster">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white/60">
              <p className="text-slate-500 text-sm font-medium">
                No team members match the current filter.
              </p>
              <button
                onClick={() => {
                  setActiveStatusFilter('all');
                  setActiveDept('All');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4 cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onUpdateStatus={updateMemberStatus}
                  onEdit={handleOpenEditModal}
                  onDelete={removeMember}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addMember}
        onUpdate={editMember}
        editingMember={editingMember}
      />
    </div>
  );
}

export default App;
