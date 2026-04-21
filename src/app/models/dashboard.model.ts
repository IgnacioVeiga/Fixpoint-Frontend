import { Attachment } from './attachment.model';

export type DashboardStorageSource = 'logical' | 'filesystem' | 'configured';

export interface DashboardStorage {
  usedBytes: number;
  fileCount: number;
  totalBytes: number | null;
  availableBytes: number | null;
  usagePercent: number | null;
  source: DashboardStorageSource;
}

export interface DashboardStats {
  ticketsByStatus: Record<string, number>;
  ticketsByMonth: { month: string; count: number }[];
  clientGrowth: { month: string; total: number }[];
  partsUsage: { name: string; count: number }[];
  topClients: { name: string; ticketCount: number }[];
  storage: DashboardStorage;
  recentFiles: Attachment[];
}

export type DashboardSource = 'api' | 'fallback' | 'mock';

export interface DashboardSnapshot {
  stats: DashboardStats;
  source: DashboardSource;
  message?: string;
}

export interface FileFolder {
  name: string;
  path: string;
  files: Attachment[];
  subfolders: FileFolder[];
}

export const EMPTY_DASHBOARD_STORAGE: DashboardStorage = {
  usedBytes: 0,
  fileCount: 0,
  totalBytes: null,
  availableBytes: null,
  usagePercent: null,
  source: 'logical'
};

export const EMPTY_DASHBOARD_STATS: DashboardStats = {
  ticketsByStatus: {
    received: 0,
    diagnosing: 0,
    waiting_parts: 0,
    repairing: 0,
    repaired: 0,
    returned: 0,
    cancelled: 0
  },
  ticketsByMonth: [],
  clientGrowth: [],
  partsUsage: [],
  topClients: [],
  storage: { ...EMPTY_DASHBOARD_STORAGE },
  recentFiles: []
};
