import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { InventoryItem, SaveInventoryRequest } from '../models/inventory.model';
import { MOCK_INVENTORY } from '../models/mock-data/inventory.mock';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'inventory';

  listInventory(): Observable<InventoryItem[]> {
    if (environment.useMockApi) {
      return of(MOCK_INVENTORY);
    }

    return this.api.get<InventoryItem[]>(this.endpoint).pipe(
      catchError((error) => this.handleError(error, 'Error al listar inventario'))
    );
  }

  getInventory(id: number): Observable<InventoryItem> {
    if (environment.useMockApi) {
      const item = MOCK_INVENTORY.find((inventory) => inventory.id === id);
      if (!item) {
        return throwError(() => new Error('Item no encontrado'));
      }
      return of(item);
    }

    return this.api.get<InventoryItem>(`${this.endpoint}/${id}`).pipe(
      catchError((error) => this.handleError(error, `Error al obtener item de inventario ${id}`))
    );
  }

  createInventory(item: SaveInventoryRequest): Observable<InventoryItem> {
    if (environment.useMockApi) {
      const mockItem: InventoryItem = {
        ...item,
        id: MOCK_INVENTORY.length + 1,
        addedAt: new Date().toISOString()
      };
      MOCK_INVENTORY.push(mockItem);
      return of(mockItem);
    }

    return this.api.post<InventoryItem>(this.endpoint, item).pipe(
      catchError((error) => this.handleError(error, 'Error al crear item de inventario'))
    );
  }

  updateInventory(id: number, item: SaveInventoryRequest): Observable<InventoryItem> {
    if (environment.useMockApi) {
      const index = MOCK_INVENTORY.findIndex((inventory) => inventory.id === id);
      if (index < 0) {
        return throwError(() => new Error('Item no encontrado'));
      }

      const updatedItem: InventoryItem = {
        ...MOCK_INVENTORY[index],
        ...item,
        id
      };
      MOCK_INVENTORY[index] = updatedItem;
      return of(updatedItem);
    }

    return this.api.put<InventoryItem>(`${this.endpoint}/${id}`, item).pipe(
      catchError((error) => this.handleError(error, `Error al actualizar item de inventario ${id}`))
    );
  }

  deleteInventory(id: number): Observable<void> {
    if (environment.useMockApi) {
      const index = MOCK_INVENTORY.findIndex((inventory) => inventory.id === id);
      if (index < 0) {
        return throwError(() => new Error('Item no encontrado'));
      }
      MOCK_INVENTORY.splice(index, 1);
      return of(undefined);
    }

    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError((error) => this.handleError(error, `Error al eliminar item de inventario ${id}`))
    );
  }

  private handleError(error: unknown, message: string): Observable<never> {
    console.error(message, error);
    return throwError(() => error);
  }
}
