import { Component, computed, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketsService } from '../service/tickets.service';
import { Ticket } from '../models/ticket.model';

@Component({
    selector: 'app-tickets',
    templateUrl: './tickets.component.html',
    styleUrls: ['./tickets.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketsComponent {
    private ticketService = inject(TicketsService);
    tickets = signal<Ticket[]>([]);

    search = signal('');
    statusFilter = signal('all'); // 'all' | 'diagnosing' | 'repairing' | 'waiting_parts' | 'repaired'

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

    formatEntryDate(value: string): string {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split('-').map(Number);
            return new Date(year, month - 1, day).toLocaleDateString();
        }
        return new Date(value).toLocaleDateString();
    }

    constructor() {
        // Carga inicial de tickets
        this.ticketService.listTickets().subscribe(data => {
            this.tickets.set(data);
        });
    }

    deleteTicket(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar este ticket?')) {
            this.ticketService.deleteTicket(id).subscribe({
                next: () => {
                    this.tickets.set(this.tickets().filter(ticket => ticket.id !== id));
                },
                error: (error) => {
                    console.error('Error al eliminar ticket:', error);
                    alert(this.extractErrorMessage(error, 'No se pudo eliminar el ticket.'));
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
