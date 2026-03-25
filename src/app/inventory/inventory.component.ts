import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { InventoryService } from '../service/inventory.service';
import { InventoryItem } from '../models/inventory.model';
import { isEditableShortcutTarget } from '../shared/keyboard-shortcuts';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent {
    private readonly inventory = inject(InventoryService);
    private readonly router = inject(Router);
    items = signal<InventoryItem[]>([]);
    loading = signal(true);
    loadError = signal<string | null>(null);

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
        this.loadInventory();
    }

    @HostListener('window:keydown.alt.n', ['$event'])
    onCreateShortcut(event: Event): void {
        const keyboardEvent = event as KeyboardEvent;
        if (isEditableShortcutTarget(keyboardEvent.target)) {
            return;
        }

        keyboardEvent.preventDefault();
        void this.router.navigate(['/inventario/nuevo']);
    }

    retryLoad(): void {
        this.loadInventory();
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

    private loadInventory(): void {
        this.loading.set(true);
        this.loadError.set(null);

        this.inventory.listInventory()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => this.items.set(data),
                error: (error) => {
                    console.error('Error loading inventory:', error);
                    this.items.set([]);
                    this.loadError.set(this.extractErrorMessage(error, 'Unable to load inventory.'));
                }
            });
    }
}
