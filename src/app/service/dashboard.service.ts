import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Attachment } from '../models/attachment.model';
import { Client } from '../models/client.model';
import {
  DashboardSnapshot,
  DashboardStats,
  DashboardStorage,
  EMPTY_DASHBOARD_STORAGE
} from '../models/dashboard.model';
import { MOCK_DASHBOARD_STATS } from '../models/mock-data/dashboard.mock';
import { Ticket, TicketStatus } from '../models/ticket.model';
import { ApiService } from './api.service';
import { AttachmentsService } from './attachments.service';
import { ClientsService } from './clients.service';
import { TicketsService } from './tickets.service';

const TICKET_STATUS_ORDER: TicketStatus[] = [
  'received',
  'diagnosing',
  'waiting_parts',
  'repairing',
  'repaired',
  'returned',
  'cancelled'
];

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly ticketsService = inject(TicketsService);
  private readonly clientsService = inject(ClientsService);
  private readonly attachmentsService = inject(AttachmentsService);

  getSnapshot(): Observable<DashboardSnapshot> {
    if (environment.useMockApi) {
      return of({
        stats: cloneDashboardStats(MOCK_DASHBOARD_STATS),
        source: 'mock'
      });
    }

    return this.api.get<DashboardStats>('dashboard/summary').pipe(
      map((stats) => ({
        stats: normalizeDashboardStats(stats),
        source: 'api' as const
      })),
      catchError(() => this.buildFallbackSnapshot())
    );
  }

  private buildFallbackSnapshot(): Observable<DashboardSnapshot> {
    return forkJoin({
      tickets: this.ticketsService.listTickets().pipe(catchError(() => of([] as Ticket[]))),
      clients: this.clientsService.listClients().pipe(catchError(() => of([] as Client[]))),
      recentFiles: this.attachmentsService.listRecentAttachments(18).pipe(catchError(() => of([] as Attachment[]))),
      storage: this.api.get<DashboardStorage>('dashboard/storage').pipe(
        map((storage) => normalizeDashboardStorage(storage)),
        catchError(() => of(cloneDashboardStorage(EMPTY_DASHBOARD_STORAGE)))
      )
    }).pipe(
      map(({ tickets, clients, recentFiles, storage }) => ({
        stats: buildDashboardStatsFromLiveData(tickets, clients, recentFiles, storage),
        source: 'fallback' as const,
        message: 'Mostrando un resumen calculado localmente porque el dashboard no respondio.'
      }))
    );
  }
}

function normalizeDashboardStats(stats: DashboardStats): DashboardStats {
  return {
    ticketsByStatus: TICKET_STATUS_ORDER.reduce((result, status) => {
      result[status] = Number(stats.ticketsByStatus?.[status] ?? 0);
      return result;
    }, {} as Record<string, number>),
    ticketsByMonth: [...(stats.ticketsByMonth ?? [])],
    clientGrowth: [...(stats.clientGrowth ?? [])],
    partsUsage: [...(stats.partsUsage ?? [])],
    topClients: [...(stats.topClients ?? [])],
    storage: normalizeDashboardStorage(stats.storage),
    recentFiles: [...(stats.recentFiles ?? [])].sort(
      (left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime()
    )
  };
}

function normalizeDashboardStorage(storage?: Partial<DashboardStorage> | null): DashboardStorage {
  return {
    usedBytes: Number(storage?.usedBytes ?? 0),
    fileCount: Number(storage?.fileCount ?? 0),
    totalBytes: normalizeNullableNumber(storage?.totalBytes),
    availableBytes: normalizeNullableNumber(storage?.availableBytes),
    usagePercent: normalizeNullableNumber(storage?.usagePercent),
    source: storage?.source ?? 'logical'
  };
}

function buildDashboardStatsFromLiveData(
  tickets: Ticket[],
  clients: Client[],
  recentFiles: Attachment[],
  storage: DashboardStorage
): DashboardStats {
  const recentMonths = buildRecentMonthKeys();
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));

  return {
    ticketsByStatus: TICKET_STATUS_ORDER.reduce((result, status) => {
      result[status] = tickets.filter((ticket) => ticket.status === status).length;
      return result;
    }, {} as Record<string, number>),
    ticketsByMonth: recentMonths.map((monthKey) => ({
      month: formatMonthLabel(monthKey),
      count: tickets.filter((ticket) => readMonthKey(ticket.entryDate) === monthKey).length
    })),
    clientGrowth: recentMonths.map((monthKey) => ({
      month: formatMonthLabel(monthKey),
      total: clients.filter((client) => {
        const createdMonth = readMonthKey(client.createdAt);
        return createdMonth !== null && createdMonth <= monthKey;
      }).length
    })),
    partsUsage: [],
    topClients: Array.from(
      tickets.reduce((counts, ticket) => {
        const clientName = clientNames.get(ticket.clientId);
        if (!clientName) {
          return counts;
        }
        counts.set(clientName, (counts.get(clientName) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    )
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 5)
      .map(([name, ticketCount]) => ({ name, ticketCount })),
    storage: normalizeDashboardStorage(storage),
    recentFiles: [...recentFiles].sort(
      (left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime()
    )
  };
}

function buildRecentMonthKeys(months = 6): string[] {
  const keys: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  cursor.setMonth(cursor.getMonth() - (months - 1));

  for (let index = 0; index < months; index++) {
    keys.push(toMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return keys;
}

function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function readMonthKey(value?: string | null): string | null {
  if (!value || value.length < 7) {
    return null;
  }
  return value.slice(0, 7);
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const formatter = new Intl.DateTimeFormat('es-AR', { month: 'short' });
  const rawLabel = formatter.format(date).replace('.', '');
  return rawLabel.slice(0, 1).toUpperCase() + rawLabel.slice(1);
}

function cloneDashboardStats(stats: DashboardStats): DashboardStats {
  return {
    ticketsByStatus: { ...stats.ticketsByStatus },
    ticketsByMonth: stats.ticketsByMonth.map((item) => ({ ...item })),
    clientGrowth: stats.clientGrowth.map((item) => ({ ...item })),
    partsUsage: stats.partsUsage.map((item) => ({ ...item })),
    topClients: stats.topClients.map((item) => ({ ...item })),
    storage: cloneDashboardStorage(stats.storage),
    recentFiles: stats.recentFiles.map((item) => ({ ...item }))
  };
}

function cloneDashboardStorage(storage: DashboardStorage): DashboardStorage {
  return {
    ...storage
  };
}

function normalizeNullableNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}
