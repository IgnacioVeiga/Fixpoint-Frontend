import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientsService } from '../../service/clients.service';
import { EnterMovesFocusDirective } from '../../shared/enter-moves-focus.directive';

const CLIENT_DNI_MAX_LENGTH = 20;
const CLIENT_PHONE_MAX_LENGTH = 30;

@Component({
    selector: 'app-client-form',
    templateUrl: './client-form.component.html',
    styleUrls: ['./client-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule, EnterMovesFocusDirective]
})
export class ClientFormComponent {
    private readonly clientService = inject(ClientsService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    readonly dniMaxLength = CLIENT_DNI_MAX_LENGTH;
    readonly phoneMaxLength = CLIENT_PHONE_MAX_LENGTH;
    readonly isEditing = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly form: FormGroup;

    constructor(private readonly fb: FormBuilder) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            dni: ['', [Validators.maxLength(CLIENT_DNI_MAX_LENGTH)]],
            phone: ['', [Validators.maxLength(CLIENT_PHONE_MAX_LENGTH)]],
            email: ['', [Validators.email]],
            address: [''],
            notes: ['']
        });

        const id = this.route.snapshot.params['id'];
        if (id && id !== 'nuevo') {
            this.isEditing.set(true);
            this.editingId.set(Number(id));
            this.clientService.getClient(Number(id)).subscribe((client) => {
                this.form.patchValue(client);
            });
        }
    }

    @HostListener('window:keydown.control.s', ['$event'])
    @HostListener('window:keydown.meta.s', ['$event'])
    onKeyboardSave(event: Event): void {
        event.preventDefault();
        this.submit();
    }

    @HostListener('window:keydown.escape', ['$event'])
    onCancelShortcut(event: Event): void {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.defaultPrevented || keyboardEvent.altKey || keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.shiftKey) {
            return;
        }

        keyboardEvent.preventDefault();
        this.cancel();
    }

    cancel(): void {
        if (this.form.dirty && !confirm('Hay cambios sin guardar. ¿Querés cancelar igualmente?')) {
            return;
        }

        void this.router.navigate(['/clientes']);
    }

    submit(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        if (this.isEditing()) {
            const id = this.editingId();
            if (!id) {
                return;
            }

            this.clientService.updateClient(id, this.form.getRawValue()).subscribe(() => {
                void this.router.navigate(['/clientes']);
            });
            return;
        }

        this.clientService.createClient(this.form.getRawValue()).subscribe(() => {
            void this.router.navigate(['/clientes']);
        });
    }
}
