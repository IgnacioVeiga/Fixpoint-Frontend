import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-clients',
    templateUrl: './clients.component.html',
    styleUrls: ['./clients.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent {
    clients = signal([
        { id: 1, name: 'Juan Pérez', dni: '12345678', phone: '1112345678', email: 'juan@mail.com', address: 'Calle 1', createdAt: '2025-07-28' },
        { id: 2, name: 'Ana Gómez', dni: '87654321', phone: '1198765432', email: 'ana@mail.com', address: 'Calle 2', createdAt: '2025-07-27' },
        { id: 3, name: 'Carlos Ruiz', dni: '11223344', phone: '1133344455', email: 'carlos@mail.com', address: 'Calle 3', createdAt: '2025-07-26' }
    ]);

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
}
