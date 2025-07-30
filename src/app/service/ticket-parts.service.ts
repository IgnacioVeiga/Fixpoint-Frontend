import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { TicketPart } from '../models/ticket-part.model';

@Injectable({ providedIn: 'root' })
export class TicketPartsService {
  private api = inject(ApiService);
  private endpoint = '/ticketparts';

  listTicketParts(ticketId: number): Observable<TicketPart[]> {
    return this.api.get<TicketPart[]>(`${this.endpoint}?ticketId=${ticketId}`);
  }

  getTicketPart(id: number): Observable<TicketPart> {
    return this.api.get<TicketPart>(`${this.endpoint}/${id}`);
  }

  createTicketPart(part: TicketPart): Observable<TicketPart> {
    return this.api.post<TicketPart>(this.endpoint, part);
  }

  updateTicketPart(id: number, part: TicketPart): Observable<TicketPart> {
    return this.api.put<TicketPart>(`${this.endpoint}/${id}`, part);
  }

  deleteTicketPart(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
