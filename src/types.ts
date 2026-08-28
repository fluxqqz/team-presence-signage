export type PresenceStatus =
  | 'hadir'
  | 'sakit'
  | 'izin_terlambat'
  | 'cuti'
  | 'lapangan'
  | 'wfh'
  | 'off';

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
    hexColor: string;
  }
> = {
  hadir: {
    label: 'Hadir',
    description: 'Hadir di kantor',
    bgClass: 'bg-stone-50',
    textClass: 'text-stone-800',
    borderClass: 'border-stone-300',
    dotClass: 'bg-[#FFF9FF]',
    badgeClass: 'bg-stone-100 text-stone-900 border-stone-300',
    hexColor: '#FFF9FF',
  },
  sakit: {
    label: 'Sakit',
    description: 'Sakit / Izin sakit',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-300',
    dotClass: 'bg-[#FF080B]',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    hexColor: '#FF080B',
  },
  izin_terlambat: {
    label: 'Izin Terlambat',
    description: 'Izin datang terlambat',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-300',
    dotClass: 'bg-[#FFFB01]',
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hexColor: '#FFFB01',
  },
  cuti: {
    label: 'Cuti',
    description: 'Cuti kerja / Libur',
    bgClass: 'bg-fuchsia-50',
    textClass: 'text-fuchsia-700',
    borderClass: 'border-fuchsia-300',
    dotClass: 'bg-[#F243FF]',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    hexColor: '#F243FF',
  },
  lapangan: {
    label: 'Lapangan',
    description: 'Tugas luar / Lapangan',
    bgClass: 'bg-cyan-50',
    textClass: 'text-cyan-700',
    borderClass: 'border-cyan-300',
    dotClass: 'bg-[#0CF2FF]',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    hexColor: '#0CF2FF',
  },
  wfh: {
    label: 'WFH',
    description: 'Work from home / Remote',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    dotClass: 'bg-[#0EFF12]',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hexColor: '#0EFF12',
  },
  off: {
    label: 'Off',
    description: 'Off / Tidak aktif',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-500',
    borderClass: 'border-stone-300',
    dotClass: 'bg-stone-400',
    badgeClass: 'bg-stone-100 text-stone-600 border-stone-300',
    hexColor: '#000000',
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

export const ROLES = [
  'Staff',
  'Lead',
  'C-level',
] as const;

export type Role = typeof ROLES[number];

export interface AutoScheduleConfig {
  enabled: boolean;
  morningTime: string;
  morningStatus: PresenceStatus;
  eveningTime: string;
  eveningStatus: PresenceStatus;
  weekdaysOnly: boolean;
}
