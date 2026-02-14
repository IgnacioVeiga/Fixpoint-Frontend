import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../service/inventory.service';
import { InventoryItem } from '../models/inventory.model';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent {
    private inventory = inject(InventoryService);
    items = signal<InventoryItem[]>([]);

    search = signal('');
    conditionFilter = signal('all');
    typeFilter = signal('');

    conditions = [
        { value: 'all', label: 'Todos' },
        { value: 'new', label: 'Nuevo' },
        { value: 'used', label: 'Usado' },
        { value: 'damaged', label: 'Dañado' }
    ];

    filteredItems = () => {
        let list = this.items();
        const cond = this.conditionFilter();
        const type = this.typeFilter().toLowerCase();
        const search = this.search().toLowerCase();
        if (cond !== 'all') list = list.filter(i => i.condition === cond);
        if (type) list = list.filter(i => (i.componentType || '').toLowerCase().includes(type));
        if (search) list = list.filter(i =>
            i.name.toLowerCase().includes(search) ||
            (i.description || '').toLowerCase().includes(search)
        );
        return list;
    };

    getConditionLabel(condition: string): string {
        const found = this.conditions.find(c => c.value === condition);
        return found ? found.label : condition;
    }

    constructor() {
        // Carga inicial de items
        this.inventory.listInventory().subscribe(data => {
            this.items.set(data);
        });
    }

    deleteItem(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar este componente?')) {
            this.inventory.deleteInventory(id).subscribe({
                next: () => {
                    this.items.set(this.items().filter(item => item.id !== id));
                },
                error: (error) => {
                    console.error('Error al eliminar componente:', error);
                    alert(this.extractErrorMessage(error, 'No se pudo eliminar el componente.'));
                }
            });
        }        
    }

    private extractErrorMessage(error: unknown, fallback: string): string {
        if (typeof error === 'object' && error !== null) {
            const maybeHttpError = error as { error?: { message?: string } };
            if (maybeHttpError.error?.message) {
                return maybeHttpError.error.message;
            }
        }
        return fallback;
    }
}
