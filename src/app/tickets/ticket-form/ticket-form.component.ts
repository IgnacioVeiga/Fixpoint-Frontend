import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Client } from '../../models/client.model';
import { TicketsService } from '../../service/tickets.service';
import { ClientsService } from '../../service/clients.service';

@Component({
    selector: 'app-ticket-form',
    templateUrl: './ticket-form.component.html',
    styleUrls: ['./ticket-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule]
})
export class TicketFormComponent {
    private ticketService = inject(TicketsService);
    private clientService = inject(ClientsService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    isEditing = signal(false);
    editingId = signal<number | null>(null);
    clients = signal<Client[]>([]);

    statusOptions = [
        { value: 'received', label: 'Recibido' },
        { value: 'diagnosing', label: 'Diagnóstico' },
        { value: 'waiting_parts', label: 'Esperando repuesto' },
        { value: 'repairing', label: 'En reparación' },
        { value: 'repaired', label: 'Finalizado' },
        { value: 'returned', label: 'Devuelto' },
        { value: 'cancelled', label: 'Cancelado' }
    ];

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            clientId: [null, Validators.required],
            deviceType: ['', Validators.required],
            brand: [''],
            model: [''],
            serialNumber: [''],
            entryDate: [new Date().toISOString().slice(0, 10), Validators.required],
            problemDescription: ['', Validators.required],
            status: ['received', Validators.required],
            needsContract: [false],
            contractSigned: [false]
        });

        // Cargar clientes
        this.clientService.listClients().subscribe(data => {
            this.clients.set(data);
        });

        // Check if we're editing
        const id = this.route.snapshot.params['id'];
        if (id && id !== 'nuevo') {
            this.isEditing.set(true);
            this.editingId.set(Number(id));
            this.ticketService.getTicket(Number(id)).subscribe(ticket => {
                this.form.patchValue(ticket);
            });
        }
    }

    get clientName() {
        const id = this.form.get('clientId')?.value;
        return this.clients()?.find((c: Client) => c.id === id)?.name || '';
    }

    submit() {
        if (this.form.valid) {
            if (this.isEditing()) {
                const id = this.editingId()!;
                this.ticketService.updateTicket(id, {
                    ...this.form.value,
                    id,
                    lastUpdated: new Date().toISOString()
                }).subscribe(() => {
                    this.router.navigate(['/tickets']);
                });
            } else {
                this.ticketService.createTicket({
                    ...this.form.value,
                    lastUpdated: new Date().toISOString()
                }).subscribe(() => {
                    this.router.navigate(['/tickets']);
                });
            }
        } else {
            this.form.markAllAsTouched();
        }
    }
}
