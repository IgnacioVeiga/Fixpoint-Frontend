import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { InventoryItem } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private api = inject(ApiService);
  private endpoint = '/inventory';

  listInventory(): Observable<InventoryItem[]> {
    return this.api.get<InventoryItem[]>(this.endpoint);
  }

  getInventory(id: number): Observable<InventoryItem> {
    return this.api.get<InventoryItem>(`${this.endpoint}/${id}`);
  }

  createInventory(item: InventoryItem): Observable<InventoryItem> {
    return this.api.post<InventoryItem>(this.endpoint, item);
  }

  updateInventory(id: number, item: InventoryItem): Observable<InventoryItem> {
    return this.api.put<InventoryItem>(`${this.endpoint}/${id}`, item);
  }

  deleteInventory(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
