import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Client } from '../../models/client.model';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-ticket-form',
    templateUrl: './ticket-form.component.html',
    styleUrls: ['./ticket-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule]
})
export class TicketFormComponent {
    clients: Client[] = [
        { id: 1, name: 'Juan Pérez', dni: '12345678', phone: '1112345678', email: 'juan@mail.com', address: 'Calle 1', createdAt: '2025-07-28' },
        { id: 2, name: 'Ana Gómez', dni: '87654321', phone: '1198765432', email: 'ana@mail.com', address: 'Calle 2', createdAt: '2025-07-27' }
    ];

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
    }

    get clientName() {
        const id = this.form.get('clientId')?.value;
        return this.clients.find(c => c.id === id)?.name || '';
    }

    submit() {
        if (this.form.valid) {
            alert('Ticket guardado: ' + JSON.stringify(this.form.value, null, 2));
        } else {
            this.form.markAllAsTouched();
        }
    }
}
