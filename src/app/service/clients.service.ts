import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private api = inject(ApiService);
  private endpoint = '/clients';

  listClients(): Observable<Client[]> {
    return this.api.get<Client[]>(`${this.endpoint}`);
  }

  getClient(id: number): Observable<Client> {
    return this.api.get<Client>(`${this.endpoint}/${id}`);
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.api.post<Client>(`${this.endpoint}`, client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.api.put<Client>(`${this.endpoint}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}