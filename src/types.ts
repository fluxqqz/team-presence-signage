export type PresenceStatus = 'present' | 'wfh' | 'meeting' | 'away' | 'leave';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl?: string;
  status: PresenceStatus;
  statusNote?: string;
  updatedAt: string;
}

export const STATUS_CONFIG: Record<
  PresenceStatus,
  {
    label: string;
    description: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
    badgeClass: string;
  }
> = {
  present: {
    label: 'Office',
    description: 'In the office',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  wfh: {
    label: 'WFH',
    description: 'Remote / Work from home',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-300',
    dotClass: 'bg-sky-500',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  meeting: {
    label: 'Meeting',
    description: 'In meeting or call',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  away: {
    label: 'Away',
    description: 'Break or stepped away',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-300',
    dotClass: 'bg-purple-500',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  leave: {
    label: 'Leave',
    description: 'Out of office or PTO',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-300',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const DEPARTMENTS = [
  'All',
  'Engineering',
  'Design',
  'Product',
  'Operations',
  'Marketing',
] as const;
