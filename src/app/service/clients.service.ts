import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Client } from '../models/client.model';
import { MOCK_CLIENTS } from '../models/mock-data/clients.mock';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'clients';

  listClients(): Observable<Client[]> {
    if (environment.useMockApi) {
      return of(MOCK_CLIENTS);
    }

    return this.api.get<Client[]>(this.endpoint).pipe(
      catchError((error) => this.handleError(error, 'Error al listar clientes'))
    );
  }

  getClient(id: number): Observable<Client> {
    if (environment.useMockApi) {
      const client = MOCK_CLIENTS.find((item) => item.id === id);
      if (!client) {
        return throwError(() => new Error('Cliente no encontrado'));
      }
      return of(client);
    }

    return this.api.get<Client>(`${this.endpoint}/${id}`).pipe(
      catchError((error) => this.handleError(error, `Error al obtener cliente ${id}`))
    );
  }

  createClient(client: Omit<Client, 'id'>): Observable<Client> {
    if (environment.useMockApi) {
      const mockClient: Client = {
        ...client,
        id: MOCK_CLIENTS.length + 1,
        createdAt: new Date().toISOString()
      };
      MOCK_CLIENTS.push(mockClient);
      return of(mockClient);
    }

    return this.api.post<Client>(this.endpoint, client).pipe(
      catchError((error) => this.handleError(error, 'Error al crear cliente'))
    );
  }

  updateClient(id: number, client: Omit<Client, 'id'>): Observable<Client> {
    if (environment.useMockApi) {
      const index = MOCK_CLIENTS.findIndex((item) => item.id === id);
      if (index < 0) {
        return throwError(() => new Error('Cliente no encontrado'));
      }

      const updatedClient: Client = { ...MOCK_CLIENTS[index], ...client, id };
      MOCK_CLIENTS[index] = updatedClient;
      return of(updatedClient);
    }

    return this.api.put<Client>(`${this.endpoint}/${id}`, client).pipe(
      catchError((error) => this.handleError(error, `Error al actualizar cliente ${id}`))
    );
  }

  deleteClient(id: number): Observable<void> {
    if (environment.useMockApi) {
      const index = MOCK_CLIENTS.findIndex((item) => item.id === id);
      if (index < 0) {
        return throwError(() => new Error('Cliente no encontrado'));
      }
      MOCK_CLIENTS.splice(index, 1);
      return of(undefined);
    }

    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError((error) => this.handleError(error, `Error al eliminar cliente ${id}`))
    );
  }

  private handleError(error: unknown, message: string): Observable<never> {
    console.error(message, error);
    return throwError(() => error);
  }
}
