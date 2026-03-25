import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientsService } from '../service/clients.service';
import { Client } from '../models/client.model';
import { isEditableShortcutTarget } from '../shared/keyboard-shortcuts';

@Component({
    selector: 'app-clients',
    templateUrl: './clients.component.html',
    styleUrls: ['./clients.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent {
    private readonly clientService = inject(ClientsService);
    private readonly router = inject(Router);
    clients = signal<Client[]>([]);
    loading = signal(true);
    loadError = signal<string | null>(null);

    search = signal('');

    filteredClients = () => {
        const search = this.search().toLowerCase();
        if (!search) return this.clients();
        return this.clients().filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.dni?.includes(search) ||
            c.phone?.includes(search) ||
            c.email?.toLowerCase().includes(search)
        );
    };

    constructor() {
        this.loadClients();
    }

    @HostListener('window:keydown.alt.n', ['$event'])
    onCreateShortcut(event: Event): void {
        const keyboardEvent = event as KeyboardEvent;
        if (isEditableShortcutTarget(keyboardEvent.target)) {
            return;
        }

        keyboardEvent.preventDefault();
        void this.router.navigate(['/clientes/nuevo']);
    }

    retryLoad(): void {
        this.loadClients();
    }

    deleteClient(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            this.clientService.deleteClient(id).subscribe({
                next: () => {
                    this.clients.set(this.clients().filter(client => client.id !== id));
                },
                error: (error) => {
                    console.error('Error al eliminar cliente:', error);
                    alert(this.extractErrorMessage(error, 'No se pudo eliminar el cliente.'));
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

    private loadClients(): void {
        this.loading.set(true);
        this.loadError.set(null);

        this.clientService.listClients()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => this.clients.set(data),
                error: (error) => {
                    console.error('Error loading clients:', error);
                    this.clients.set([]);
                    this.loadError.set(this.extractErrorMessage(error, 'Unable to load clients.'));
                }
            });
    }
}
