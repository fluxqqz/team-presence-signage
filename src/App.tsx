import { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronDown, Search, SlidersHorizontal, Users2 } from 'lucide-react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { DepartmentTabs } from './components/DepartmentTabs';
import { MemberCard } from './components/MemberCard';
import { MemberModal } from './components/MemberModal';
import { PinLockScreen } from './components/PinLockScreen';
import { ChangePinModal } from './components/ChangePinModal';
import { useTeamPresence } from './hooks/useTeamPresence';
import { useAdminAuth } from './hooks/useAdminAuth';
import { PresenceStatus, STATUS_CONFIG, TeamMember } from './types';

export function App() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    error: authError,
    login,
    logout,
    changePin,
    setError: setAuthError,
  } = useAdminAuth();

  const { members, isLoading, error, updateMemberStatus, updateAllStatus, addMember, editMember, removeMember } = useTeamPresence();
  const [activeStatusFilter, setActiveStatusFilter] = useState<PresenceStatus | 'all'>('all');
  const [activeDept, setActiveDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSetAllOpen, setIsSetAllOpen] = useState(false);
  const setAllRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!setAllRef.current?.contains(e.target as Node)) {
        setIsSetAllOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const deptFilteredMembers = useMemo(() => {
    if (activeDept === 'All') return members;
    return members.filter((member) => member.department === activeDept);
  }, [members, activeDept]);

  const statusCounts = useMemo(() => {
    const counts: Record<PresenceStatus, number> = {
      hadir: 0,
      sakit: 0,
      izin_terlambat: 0,
      cuti: 0,
      lapangan: 0,
      wfh: 0,
      off: 0,
    };
    deptFilteredMembers.forEach((member) => counts[member.status]++);
    return counts;
  }, [deptFilteredMembers]);

  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { All: members.length };
    members.forEach((member) => { counts[member.department] = (counts[member.department] || 0) + 1; });
    return counts;
  }, [members]);

  const filteredMembers = useMemo(() => members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (activeStatusFilter === 'all' || member.status === activeStatusFilter)
      && (activeDept === 'All' || member.department === activeDept)
      && (!query || member.name.toLowerCase().includes(query) || member.role.toLowerCase().includes(query) || member.statusNote?.toLowerCase().includes(query));
  }), [members, activeStatusFilter, activeDept, searchQuery]);

  const clearFilters = () => {
    setActiveStatusFilter('all');
    setActiveDept('All');
    setSearchQuery('');
  };

  const openAddModal = () => { setEditingMember(null); setIsModalOpen(true); };
  const openEditModal = (member: TeamMember) => { setEditingMember(member); setIsModalOpen(true); };

  if (!isAuthenticated) {
    return (
      <PinLockScreen
        onUnlock={login}
        isLoading={isAuthLoading}
        errorMessage={authError}
        onClearError={() => setAuthError(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-stone-900 antialiased">
      <Header
        onAddMember={openAddModal}
        totalMembers={members.length}
        onChangePin={() => setIsChangePinOpen(true)}
        onLock={logout}
      />
      <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 border-b border-stone-300 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">People operations</p>
            <h2 className="font-serif text-4xl tracking-tight text-stone-950 sm:text-5xl">Team directory</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">Update availability, keep context close, and see the shape of your team at a glance.</p>
          </div>
          <p className="font-mono text-xs text-stone-500">{filteredMembers.length} of {members.length} people shown</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-label="Team roster" className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block w-full sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                  <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search people, roles, or notes" className="w-full rounded-full border border-stone-300 bg-[#fbfaf7] py-2.5 pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
                </label>

                {/* Set all status dropdown */}
                <div className="relative" ref={setAllRef}>
                  <button
                    type="button"
                    onClick={() => setIsSetAllOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm transition hover:border-stone-400 hover:text-stone-950 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                    aria-expanded={isSetAllOpen}
                  >
                    <Users2 className="h-3.5 w-3.5 text-stone-500" />
                    <span>Set all status</span>
                    <ChevronDown className="h-3 w-3 text-stone-400" />
                  </button>

                  {isSetAllOpen && (
                    <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white py-1.5 shadow-xl animate-in fade-in zoom-in-95">
                      <div className="border-b border-stone-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Set all to:
                      </div>
                      {(Object.keys(STATUS_CONFIG) as PresenceStatus[]).map((status) => {
                        const config = STATUS_CONFIG[status];
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              setIsSetAllOpen(false);
                              updateAllStatus(status);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-stone-800 transition hover:bg-stone-50"
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} />
                            <span>{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {(activeStatusFilter !== 'all' || activeDept !== 'All' || searchQuery) && <button onClick={clearFilters} className="self-start text-sm font-semibold text-stone-600 underline decoration-stone-400 underline-offset-4 transition hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900 sm:self-auto">Clear filters</button>}
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-stone-300 bg-[#fbfaf7] px-6 py-20 text-center">
                <p className="font-serif text-2xl text-stone-900">Loading directory</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
                <p className="font-serif text-xl text-rose-900">Could not load the directory</p>
                <p className="mt-2 text-sm text-rose-700">{error}</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-[#fbfaf7] px-6 py-20 text-center">
                <p className="font-serif text-2xl text-stone-900">No people found</p>
                <p className="mt-2 text-sm text-stone-500">Try clearing or changing the current filters.</p>
                <button onClick={clearFilters} className="mt-5 text-sm font-bold text-stone-900 underline underline-offset-4">Clear all filters</button>
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-300 bg-[#fbfaf7] shadow-[0_12px_32px_rgba(65,55,40,0.06)]">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-stone-200 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500 sm:grid-cols-[minmax(0,1fr)_150px_110px]">
                  <span>Person</span><span className="hidden sm:block">Availability</span><span className="text-right">Actions</span>
                </div>
                <div>{filteredMembers.map((member) => <MemberCard key={member.id} member={member} onUpdateStatus={updateMemberStatus} onEdit={openEditModal} onDelete={removeMember} />)}</div>
              </div>
            )}
          </section>

          <aside aria-label="Directory controls" className="space-y-5 lg:sticky lg:top-24">
            <StatsBar
              statusCounts={statusCounts}
              total={deptFilteredMembers.length}
              activeFilter={activeStatusFilter}
              onFilterChange={setActiveStatusFilter}
              activeDept={activeDept}
            />
            <section className="rounded-2xl border border-stone-300 bg-[#fbfaf7] p-5 shadow-[0_12px_32px_rgba(65,55,40,0.06)]">
              <div className="mb-4 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-stone-500" aria-hidden="true" /><h3 className="font-serif text-xl text-stone-950">Filter by team</h3></div>
              <DepartmentTabs activeDept={activeDept} onSelectDept={setActiveDept} departmentCounts={departmentCounts} />
            </section>
          </aside>
        </div>
      </main>
      <MemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addMember} onUpdate={editMember} editingMember={editingMember} />
      <ChangePinModal isOpen={isChangePinOpen} onClose={() => setIsChangePinOpen(false)} onChangePin={changePin} />
    </div>
  );
}

export default App;
