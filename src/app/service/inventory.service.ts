import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, catchError, of } from 'rxjs';
import { InventoryItem } from '../models/inventory.model';
import { MOCK_INVENTORY } from '../models/mock-data/inventory.mock';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private api = inject(ApiService);
  private endpoint = 'inventory';

  listInventory(): Observable<InventoryItem[]> {
    return this.api.get<InventoryItem[]>(this.endpoint).pipe(
      catchError(error => {
        console.error('Error al listar inventario:', error);
        return of(MOCK_INVENTORY);
      })
    );
  }

  getInventory(id: number): Observable<InventoryItem> {
    return this.api.get<InventoryItem>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener item de inventario ${id}:`, error);
        const mockItem = MOCK_INVENTORY.find(item => item.id === id);
        if (mockItem) {
          return of(mockItem);
        }
        throw new Error('Item no encontrado');
      })
    );
  }

  createInventory(item: InventoryItem): Observable<InventoryItem> {
    return this.api.post<InventoryItem>(this.endpoint, item).pipe(
      catchError(error => {
        console.error('Error al crear item de inventario:', error);
        const mockItem = {
          ...item,
          id: MOCK_INVENTORY.length + 1,
          addedAt: new Date().toISOString()
        };
        MOCK_INVENTORY.push(mockItem);
        return of(mockItem);
      })
    );
  }

  updateInventory(id: number, item: InventoryItem): Observable<InventoryItem> {
    return this.api.put<InventoryItem>(`${this.endpoint}/${id}`, item).pipe(
      catchError(error => {
        console.error(`Error al actualizar item de inventario ${id}:`, error);
        const index = MOCK_INVENTORY.findIndex(i => i.id === id);
        if (index >= 0) {
          MOCK_INVENTORY[index] = { ...item, id };
          return of(MOCK_INVENTORY[index]);
        }
        throw new Error('Item no encontrado');
      })
    );
  }

  deleteInventory(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar item de inventario ${id}:`, error);
        const index = MOCK_INVENTORY.findIndex(i => i.id === id);
        if (index >= 0) {
          MOCK_INVENTORY.splice(index, 1);
          return of(undefined);
        }
        throw new Error('Item no encontrado');
      })
    );
  }
}
