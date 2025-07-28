import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-tickets',
    templateUrl: './tickets.component.html',
    styleUrls: ['./tickets.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketsComponent {
    tickets = signal([
        {
            id: 1,
            clientId: 1,
            deviceType: 'Televisor',
            brand: 'Samsung',
            model: 'Q60',
            serialNumber: 'SN123',
            entryDate: '2025-07-28',
            problemDescription: 'No enciende',
            status: 'diagnosing',
            needsContract: false,
            contractSigned: false,
            createdBy: 'admin',
            lastUpdated: '2025-07-28T10:00:00Z'
        },
        {
            id: 2,
            clientId: 2,
            deviceType: 'Celular',
            brand: 'Motorola',
            model: 'G8',
            serialNumber: 'SN456',
            entryDate: '2025-07-27',
            problemDescription: 'Pantalla rota',
            status: 'waiting_parts',
            needsContract: false,
            contractSigned: false,
            createdBy: 'admin',
            lastUpdated: '2025-07-28T09:00:00Z'
        }
    ]);

    search = signal('');
    statusFilter = signal('all');

    estados = [
        { value: 'all', label: 'Todos' },
        { value: 'diagnosing', label: 'Diagnóstico' },
        { value: 'repairing', label: 'En reparación' },
        { value: 'waiting_parts', label: 'Esperando repuesto' },
        { value: 'repaired', label: 'Finalizado' },
    ];

    filteredTickets = computed(() => {
        let list = this.tickets();
        const status = this.statusFilter();
        const search = this.search().toLowerCase();
        if (status !== 'all') {
            list = list.filter(t => t.status === status);
        }
        if (search) {
            list = list.filter(t =>
                t.deviceType.toLowerCase().includes(search) ||
                t.brand?.toLowerCase().includes(search) ||
                t.model?.toLowerCase().includes(search) ||
                t.problemDescription?.toLowerCase().includes(search)
            );
        }
        return list;
    });

    getStatusLabel(status: string): string {
        const found = this.estados.find(e => e.value === status);
        return found ? found.label : status;
    }
}
