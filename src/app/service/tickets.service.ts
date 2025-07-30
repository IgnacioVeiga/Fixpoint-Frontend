import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private api = inject(ApiService);
  private endpoint = '/tickets';

  listTickets(): Observable<Ticket[]> {
    return this.api.get<Ticket[]>(this.endpoint);
  }

  getTicket(id: number): Observable<Ticket> {
    return this.api.get<Ticket>(`${this.endpoint}/${id}`);
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.api.post<Ticket>(this.endpoint, ticket);
  }

  updateTicket(id: number, ticket: Ticket): Observable<Ticket> {
    return this.api.put<Ticket>(`${this.endpoint}/${id}`, ticket);
  }

  deleteTicket(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
