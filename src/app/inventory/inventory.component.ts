import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent {
    items = signal([
        { id: 1, name: 'Capacitor 100uF', componentType: 'capacitor', description: 'Electrolítico', condition: 'new', source: 'comprado', quantity: 10, location: 'Caja A', addedAt: '2025-07-28' },
        { id: 2, name: 'Display LCD', componentType: 'display', description: '16x2', condition: 'used', source: 'reciclado', quantity: 2, location: 'Estante 2', addedAt: '2025-07-27' },
        { id: 3, name: 'Placa base TV', componentType: 'board', description: 'Samsung Q60', condition: 'damaged', source: 'donado', quantity: 1, location: 'Caja B', addedAt: '2025-07-26' }
    ]);

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
}
