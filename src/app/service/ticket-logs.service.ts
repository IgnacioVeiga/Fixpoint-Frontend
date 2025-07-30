import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { TicketLog } from '../models/ticket-log.model';

@Injectable({ providedIn: 'root' })
export class TicketLogsService {
  private api = inject(ApiService);
  private endpoint = '/ticketlogs';

  listTicketLogs(ticketId: number): Observable<TicketLog[]> {
    return this.api.get<TicketLog[]>(`${this.endpoint}?ticketId=${ticketId}`);
  }

  getTicketLog(id: number): Observable<TicketLog> {
    return this.api.get<TicketLog>(`${this.endpoint}/${id}`);
  }

  createTicketLog(log: TicketLog): Observable<TicketLog> {
    return this.api.post<TicketLog>(this.endpoint, log);
  }

  updateTicketLog(id: number, log: TicketLog): Observable<TicketLog> {
    return this.api.put<TicketLog>(`${this.endpoint}/${id}`, log);
  }

  deleteTicketLog(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
