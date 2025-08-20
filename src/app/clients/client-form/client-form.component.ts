import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ClientsService } from '../../service/clients.service';

@Component({
    selector: 'app-client-form',
    templateUrl: './client-form.component.html',
    styleUrls: ['./client-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule]
})
export class ClientFormComponent {
    private clientService = inject(ClientsService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    isEditing = signal(false);
    editingId = signal<number | null>(null);
    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            dni: [''],
            phone: [''],
            email: ['', [Validators.email]],
            address: [''],
            notes: ['']
        });

        // Check if we're editing
        const id = this.route.snapshot.params['id'];
        if (id && id !== 'nuevo') {
            this.isEditing.set(true);
            this.editingId.set(Number(id));
            this.clientService.getClient(Number(id)).subscribe(client => {
                this.form.patchValue(client);
            });
        }
    }

    submit() {
        if (this.form.valid) {
            if (this.isEditing()) {
                const id = this.editingId()!;
                this.clientService.updateClient(id, {
                    ...this.form.value,
                    id
                }).subscribe(() => {
                    this.router.navigate(['/clientes']);
                });
            } else {
                this.clientService.createClient({
                    ...this.form.value
                }).subscribe(() => {
                    this.router.navigate(['/clientes']);
                });
            }
        } else {
            this.form.markAllAsTouched();
        }
    }
}
