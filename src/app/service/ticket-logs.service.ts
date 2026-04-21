import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CreateTicketLogRequest, TicketLog } from '../models/ticket-log.model';
import { environment } from '../../environments/environment';
import { MOCK_TICKET_LOGS_BY_TICKET } from '../models/mock-data/tickets.mock';

@Injectable({ providedIn: 'root' })
export class TicketLogsService {
  private readonly api = inject(ApiService);
  private readonly mockLogsByTicket = new Map<number, TicketLog[]>();

  constructor() {
    Object.entries(MOCK_TICKET_LOGS_BY_TICKET).forEach(([ticketId, logs]) => {
      this.mockLogsByTicket.set(Number(ticketId), logs.map((log) => ({ ...log })));
    });
  }

  listTicketLogs(ticketId: number): Observable<TicketLog[]> {
    if (environment.useMockApi) {
      return of((this.mockLogsByTicket.get(ticketId) ?? []).map((log) => ({ ...log })));
    }

    return this.api.get<TicketLog[]>(`tickets/${ticketId}/logs`).pipe(
      catchError((error) => this.handleError(error, `Error al listar logs del ticket ${ticketId}`))
    );
  }

  createTicketLog(ticketId: number, log: CreateTicketLogRequest): Observable<TicketLog> {
    if (environment.useMockApi) {
      const existingLogs = this.mockLogsByTicket.get(ticketId) ?? [];
      const newLog: TicketLog = {
        id: Date.now(),
        ticketId,
        description: log.description,
        author: log.author,
        timestamp: new Date().toISOString()
      };
      this.mockLogsByTicket.set(ticketId, [newLog, ...existingLogs]);
      return of(newLog);
    }

    return this.api.post<TicketLog>(`tickets/${ticketId}/logs`, log).pipe(
      catchError((error) => this.handleError(error, `Error al crear log del ticket ${ticketId}`))
    );
  }

  private handleError(error: unknown, message: string): Observable<never> {
    console.error(message, error);
    return throwError(() => error);
  }
}
