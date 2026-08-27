export type PresenceStatus =
  | 'hadir'
  | 'sakit'
  | 'izin_terlambat'
  | 'cuti'
  | 'lapangan'
  | 'wfh';

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
  hadir: {
    label: 'Hadir',
    description: 'Hadir di kantor',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  sakit: {
    label: 'Sakit',
    description: 'Sakit / Izin sakit',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-300',
    dotClass: 'bg-yellow-500',
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  izin_terlambat: {
    label: 'Izin Terlambat',
    description: 'Izin datang terlambat',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-300',
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  cuti: {
    label: 'Cuti',
    description: 'Cuti kerja / Libur',
    bgClass: 'bg-fuchsia-50',
    textClass: 'text-fuchsia-700',
    borderClass: 'border-fuchsia-300',
    dotClass: 'bg-fuchsia-500',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  },
  lapangan: {
    label: 'Lapangan',
    description: 'Tugas luar / Lapangan',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-300',
    dotClass: 'bg-teal-500',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  wfh: {
    label: 'WFH',
    description: 'Work from home / Remote',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-300',
    dotClass: 'bg-sky-500',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
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
