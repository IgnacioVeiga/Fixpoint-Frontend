import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AddTicketPartRequest, TicketPart } from '../models/ticket-part.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketPartsService {
  private readonly api = inject(ApiService);
  private readonly mockPartsByTicket = new Map<number, TicketPart[]>();

  listTicketParts(ticketId: number): Observable<TicketPart[]> {
    if (environment.useMockApi) {
      return of(this.mockPartsByTicket.get(ticketId) ?? []);
    }

    return this.api.get<TicketPart[]>(`tickets/${ticketId}/parts`).pipe(
      catchError((error) => this.handleError(error, `Error al listar piezas del ticket ${ticketId}`))
    );
  }

  createTicketPart(ticketId: number, part: AddTicketPartRequest): Observable<TicketPart> {
    if (environment.useMockApi) {
      const existingParts = this.mockPartsByTicket.get(ticketId) ?? [];
      const newPart: TicketPart = {
        id: Date.now(),
        inventoryId: part.inventoryId,
        quantity: part.quantity,
        note: part.note
      };
      this.mockPartsByTicket.set(ticketId, [...existingParts, newPart]);
      return of(newPart);
    }

    return this.api.post<TicketPart>(`tickets/${ticketId}/parts`, part).pipe(
      catchError((error) => this.handleError(error, `Error al agregar pieza al ticket ${ticketId}`))
    );
  }

  private handleError(error: unknown, message: string): Observable<never> {
    console.error(message, error);
    return throwError(() => error);
  }
}
