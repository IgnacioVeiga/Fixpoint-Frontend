import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SaveTicketRequest, Ticket, TicketStatusDefinition } from '../models/ticket.model';
import { MOCK_TICKETS, MOCK_TICKET_STATUS_DEFINITIONS } from '../models/mock-data/tickets.mock';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'tickets';

  listStatusDefinitions(): Observable<TicketStatusDefinition[]> {
    if (environment.useMockFallback) {
      return of(MOCK_TICKET_STATUS_DEFINITIONS);
    }

    return this.api.get<TicketStatusDefinition[]>(`${this.endpoint}/statuses`).pipe(
      catchError((error) => this.handleError(error, 'Error al listar estados de ticket'))
    );
  }

  listTickets(): Observable<Ticket[]> {
    if (environment.useMockFallback) {
      return of(MOCK_TICKETS);
    }

    return this.api.get<Ticket[]>(this.endpoint).pipe(
      catchError((error) => this.handleError(error, 'Error al listar tickets'))
    );
  }

  getTicket(id: number): Observable<Ticket> {
    if (environment.useMockFallback) {
      const ticket = MOCK_TICKETS.find((item) => item.id === id);
      if (!ticket) {
        return throwError(() => new Error('Ticket no encontrado'));
      }
      return of(ticket);
    }

    return this.api.get<Ticket>(`${this.endpoint}/${id}`).pipe(
      catchError((error) => this.handleError(error, `Error al obtener ticket ${id}`))
    );
  }

  createTicket(ticket: SaveTicketRequest): Observable<Ticket> {
    if (environment.useMockFallback) {
      const mockTicket: Ticket = {
        ...ticket,
        id: MOCK_TICKETS.length + 1,
        lastUpdated: new Date().toISOString(),
        entryDate: ticket.entryDate ?? new Date().toISOString()
      };
      MOCK_TICKETS.push(mockTicket);
      return of(mockTicket);
    }

    return this.api.post<Ticket>(this.endpoint, ticket).pipe(
      catchError((error) => this.handleError(error, 'Error al crear ticket'))
    );
  }

  updateTicket(id: number, ticket: SaveTicketRequest): Observable<Ticket> {
    if (environment.useMockFallback) {
      const index = MOCK_TICKETS.findIndex((item) => item.id === id);
      if (index < 0) {
        return throwError(() => new Error('Ticket no encontrado'));
      }

      const updatedTicket: Ticket = {
        ...MOCK_TICKETS[index],
        ...ticket,
        id,
        lastUpdated: new Date().toISOString()
      };
      MOCK_TICKETS[index] = updatedTicket;
      return of(updatedTicket);
    }

    return this.api.put<Ticket>(`${this.endpoint}/${id}`, ticket).pipe(
      catchError((error) => this.handleError(error, `Error al actualizar ticket ${id}`))
    );
  }

  deleteTicket(id: number): Observable<void> {
    if (environment.useMockFallback) {
      const index = MOCK_TICKETS.findIndex((item) => item.id === id);
      if (index < 0) {
        return throwError(() => new Error('Ticket no encontrado'));
      }
      MOCK_TICKETS.splice(index, 1);
      return of(undefined);
    }

    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError((error) => this.handleError(error, `Error al eliminar ticket ${id}`))
    );
  }

  private handleError(error: unknown, message: string): Observable<never> {
    console.error(message, error);
    return throwError(() => error);
  }
}
