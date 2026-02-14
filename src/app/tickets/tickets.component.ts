import { Component, computed, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TicketsService } from '../service/tickets.service';
import { Ticket } from '../models/ticket.model';
import { LocaleDateService } from '../service/locale-date.service';

@Component({
    selector: 'app-tickets',
    templateUrl: './tickets.component.html',
    styleUrls: ['./tickets.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketsComponent {
    private ticketService = inject(TicketsService);
    private readonly localeDate = inject(LocaleDateService);
    tickets = signal<Ticket[]>([]);
    loading = signal(true);
    loadError = signal<string | null>(null);

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
        return this.localeDate.formatDateOnly(value);
    }

    constructor() {
        this.loadTickets();
    }

    retryLoad(): void {
        this.loadTickets();
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

    private loadTickets(): void {
        this.loading.set(true);
        this.loadError.set(null);

        this.ticketService.listTickets()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => this.tickets.set(data),
                error: (error) => {
                    console.error('Error loading tickets:', error);
                    this.tickets.set([]);
                    this.loadError.set(this.extractErrorMessage(error, 'Unable to load tickets.'));
                }
            });
    }
}
