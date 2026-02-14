import { Component, computed, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TicketsService } from '../service/tickets.service';
import { Ticket, TicketStatus, TicketStatusDefinition } from '../models/ticket.model';
import { LocaleDateService } from '../service/locale-date.service';

type StatusFilterValue = 'all' | TicketStatus;
type StatusFilterOption = { value: StatusFilterValue; label: string };

const STATUS_LABELS: Record<TicketStatus, string> = {
    received: 'Recibido',
    diagnosing: 'Diagnostico',
    waiting_parts: 'Esperando repuesto',
    repairing: 'En reparacion',
    repaired: 'Finalizado',
    returned: 'Devuelto',
    cancelled: 'Cancelado'
};

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
    statusDefinitions = signal<TicketStatusDefinition[]>(this.fallbackStatusDefinitions());
    loading = signal(true);
    loadError = signal<string | null>(null);

    search = signal('');
    statusFilter = signal<StatusFilterValue>('all');
    estados = computed<StatusFilterOption[]>(() => [
        { value: 'all', label: 'Todos' },
        ...this.statusDefinitions().map((definition) => ({
            value: definition.value,
            label: STATUS_LABELS[definition.value]
        }))
    ]);

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
        if (status in STATUS_LABELS) {
            return STATUS_LABELS[status as TicketStatus];
        }
        return status;
    }

    formatEntryDate(value: string): string {
        return this.localeDate.formatDateOnly(value);
    }

    constructor() {
        this.loadStatusDefinitions();
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

    private loadStatusDefinitions(): void {
        this.ticketService.listStatusDefinitions().subscribe({
            next: (definitions) => {
                this.statusDefinitions.set(definitions.length > 0 ? definitions : this.fallbackStatusDefinitions());
                this.ensureStatusFilterValueIsValid();
            },
            error: (error) => {
                console.error('Error loading status definitions:', error);
                this.statusDefinitions.set(this.fallbackStatusDefinitions());
                this.ensureStatusFilterValueIsValid();
            }
        });
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

    private ensureStatusFilterValueIsValid(): void {
        const filterValue = this.statusFilter();
        if (filterValue === 'all') {
            return;
        }

        const isValidStatus = this.statusDefinitions().some((definition) => definition.value === filterValue);
        if (!isValidStatus) {
            this.statusFilter.set('all');
        }
    }

    private fallbackStatusDefinitions(): TicketStatusDefinition[] {
        return [
            { value: 'received', closed: false, nextStatuses: ['diagnosing', 'cancelled'] },
            { value: 'diagnosing', closed: false, nextStatuses: ['waiting_parts', 'repairing', 'cancelled'] },
            { value: 'waiting_parts', closed: false, nextStatuses: ['repairing', 'cancelled'] },
            { value: 'repairing', closed: false, nextStatuses: ['waiting_parts', 'repaired', 'cancelled'] },
            { value: 'repaired', closed: false, nextStatuses: ['returned', 'cancelled'] },
            { value: 'returned', closed: true, nextStatuses: [] },
            { value: 'cancelled', closed: true, nextStatuses: [] }
        ];
    }
}
