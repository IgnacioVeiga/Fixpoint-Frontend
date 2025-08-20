import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, catchError, of } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { MOCK_TICKETS } from '../models/mock-data/tickets.mock';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private api = inject(ApiService);
  private endpoint = 'tickets';

  listTickets(): Observable<Ticket[]> {
    return this.api.get<Ticket[]>(this.endpoint).pipe(
      catchError(error => {
        console.error('Error al listar tickets:', error);
        return of(MOCK_TICKETS);
      })
    );
  }

  getTicket(id: number): Observable<Ticket> {
    return this.api.get<Ticket>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener ticket ${id}:`, error);
        const mockTicket = MOCK_TICKETS.find(t => t.id === id);
        if (mockTicket) {
          return of(mockTicket);
        }
        throw new Error('Ticket no encontrado');
      })
    );
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.api.post<Ticket>(this.endpoint, ticket).pipe(
      catchError(error => {
        console.error('Error al crear ticket:', error);
        const mockTicket = {
          ...ticket,
          id: MOCK_TICKETS.length + 1,
          lastUpdated: new Date().toISOString(),
          entryDate: new Date().toISOString()
        };
        MOCK_TICKETS.push(mockTicket);
        return of(mockTicket);
      })
    );
  }

  updateTicket(id: number, ticket: Ticket): Observable<Ticket> {
    return this.api.put<Ticket>(`${this.endpoint}/${id}`, ticket).pipe(
      catchError(error => {
        console.error(`Error al actualizar ticket ${id}:`, error);
        const index = MOCK_TICKETS.findIndex(t => t.id === id);
        if (index >= 0) {
          MOCK_TICKETS[index] = {
            ...ticket,
            id,
            lastUpdated: new Date().toISOString()
          };
          return of(MOCK_TICKETS[index]);
        }
        throw new Error('Ticket no encontrado');
      })
    );
  }

  deleteTicket(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar ticket ${id}:`, error);
        const index = MOCK_TICKETS.findIndex(t => t.id === id);
        if (index >= 0) {
          MOCK_TICKETS.splice(index, 1);
          return of(undefined);
        }
        throw new Error('Ticket no encontrado');
      })
    );
  }
}
