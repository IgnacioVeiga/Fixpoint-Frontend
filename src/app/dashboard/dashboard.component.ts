import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule]
})
export class DashboardComponent {
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

    statusFilter = signal('all'); // 'all' | 'diagnosing' | 'repairing' | 'waiting_parts' | 'repaired'

    filteredTickets = computed(() => {
        const status = this.statusFilter();
        if (status === 'all') return this.tickets();
        return this.tickets().filter((t: any) => t.status === status);
    });

    estados = [
        { value: 'all', label: 'Todos' },
        { value: 'diagnosing', label: 'Diagnóstico' },
        { value: 'repairing', label: 'En reparación' },
        { value: 'waiting_parts', label: 'Esperando repuesto' },
        { value: 'repaired', label: 'Finalizado' },
    ];

    getStatusLabel(status: string): string {
        const found = this.estados.find(e => e.value === status);
        return found ? found.label : status;
    }
}