import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, catchError, of } from 'rxjs';
import { Client } from '../models/client.model';
import { MOCK_CLIENTS } from '../models/mock-data/clients.mock';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private api = inject(ApiService);
  private endpoint = 'clients';

  listClients(): Observable<Client[]> {
    return this.api.get<Client[]>(`${this.endpoint}`).pipe(
      catchError(error => {
        console.error('Error al listar clientes:', error);
        return of(MOCK_CLIENTS);
      })
    );
  }

  getClient(id: number): Observable<Client> {
    return this.api.get<Client>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener cliente ${id}:`, error);
        const mockClient = MOCK_CLIENTS.find(c => c.id === id);
        if (mockClient) {
          return of(mockClient);
        }
        throw new Error('Cliente no encontrado');
      })
    );
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.api.post<Client>(`${this.endpoint}`, client).pipe(
      catchError(error => {
        console.error('Error al crear cliente:', error);
        const mockClient = {
          ...client,
          id: MOCK_CLIENTS.length + 1,
          createdAt: new Date().toISOString()
        } as Client;
        MOCK_CLIENTS.push(mockClient);
        return of(mockClient);
      })
    );
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.api.put<Client>(`${this.endpoint}/${id}`, client).pipe(
      catchError(error => {
        console.error(`Error al actualizar cliente ${id}:`, error);
        const index = MOCK_CLIENTS.findIndex(c => c.id === id);
        if (index >= 0) {
          const updatedClient = { ...MOCK_CLIENTS[index], ...client, id } as Client;
          MOCK_CLIENTS[index] = updatedClient;
          return of(updatedClient);
        }
        throw new Error('Cliente no encontrado');
      })
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar cliente ${id}:`, error);
        const index = MOCK_CLIENTS.findIndex(c => c.id === id);
        if (index >= 0) {
          MOCK_CLIENTS.splice(index, 1);
          return of(undefined);
        }
        throw new Error('Cliente no encontrado');
      })
    );
  }
}