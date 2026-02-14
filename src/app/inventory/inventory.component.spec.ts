import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { InventoryItem } from '../models/inventory.model';
import { InventoryService } from '../service/inventory.service';
import { InventoryComponent } from './inventory.component';

describe('InventoryComponent', () => {
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;

  const inventoryItem: InventoryItem = {
    id: 1,
    name: 'Display 7in',
    componentType: 'display',
    description: 'Spare screen',
    condition: 'new',
    source: 'supplier',
    quantity: 4,
    location: 'Shelf A',
    addedAt: '2026-02-14T10:00:00'
  };

  beforeEach(async () => {
    inventoryServiceSpy = jasmine.createSpyObj<InventoryService>('InventoryService', ['listInventory', 'deleteInventory']);

    await TestBed.configureTestingModule({
      imports: [InventoryComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: InventoryService, useValue: inventoryServiceSpy }
      ]
    }).compileComponents();
  });

  it('should show load error and recover after retry', () => {
    inventoryServiceSpy.listInventory.and.returnValues(
      throwError(() => ({ error: { message: 'Inventory offline' } })),
      of([inventoryItem])
    );

    const fixture = TestBed.createComponent(InventoryComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Inventory offline');

    const retryButton = fixture.nativeElement.querySelector('.btn-inline') as HTMLButtonElement;
    retryButton.click();
    fixture.detectChanges();

    expect(inventoryServiceSpy.listInventory).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.loadError()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Display 7in');
  });
});
