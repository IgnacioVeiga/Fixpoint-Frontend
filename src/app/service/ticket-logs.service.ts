import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CreateTicketLogRequest, TicketLog } from '../models/ticket-log.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketLogsService {
  private readonly api = inject(ApiService);
  private readonly mockLogsByTicket = new Map<number, TicketLog[]>();

  listTicketLogs(ticketId: number): Observable<TicketLog[]> {
    if (environment.useMockFallback) {
      return of(this.mockLogsByTicket.get(ticketId) ?? []);
    }

    return this.api.get<TicketLog[]>(`tickets/${ticketId}/logs`).pipe(
      catchError((error) => this.handleError(error, `Error al listar logs del ticket ${ticketId}`))
    );
  }

  createTicketLog(ticketId: number, log: CreateTicketLogRequest): Observable<TicketLog> {
    if (environment.useMockFallback) {
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
