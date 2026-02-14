import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientsService } from '../service/clients.service';
import { Client } from '../models/client.model';

@Component({
    selector: 'app-clients',
    templateUrl: './clients.component.html',
    styleUrls: ['./clients.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent {
    private clientService = inject(ClientsService);
    clients = signal<Client[]>([]);

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
        // Carga inicial de clientes
        this.clientService.listClients().subscribe(data => {
            this.clients.set(data);
        });
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
}
