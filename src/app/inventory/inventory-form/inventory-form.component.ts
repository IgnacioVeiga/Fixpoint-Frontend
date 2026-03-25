import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../service/inventory.service';
import { EnterMovesFocusDirective } from '../../shared/enter-moves-focus.directive';

@Component({
    selector: 'app-inventory-form',
    templateUrl: './inventory-form.component.html',
    styleUrls: ['./inventory-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule, EnterMovesFocusDirective]
})
export class InventoryFormComponent {
    private readonly inventory = inject(InventoryService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    readonly isEditing = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly conditions = [
        { value: 'new', label: 'Nuevo' },
        { value: 'used', label: 'Usado' },
        { value: 'damaged', label: 'Dañado' }
    ];
    readonly componentTypeSuggestions = ['Pantalla', 'Fuente', 'Motherboard', 'Cable', 'Conector', 'Bateria'];
    readonly sourceSuggestions = ['Proveedor', 'Reciclado', 'Donado', 'Retirado de otro equipo'];
    readonly locationSuggestions = ['Estante A-1', 'Estante B-2', 'Caja mostrador', 'Deposito'];
    readonly form: FormGroup;

    constructor(private readonly fb: FormBuilder) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            componentType: [''],
            description: [''],
            condition: ['new', Validators.required],
            source: [''],
            quantity: [1, [Validators.required, Validators.min(1)]],
            location: ['']
        });

        const id = this.route.snapshot.params['id'];
        if (id && id !== 'nuevo') {
            this.isEditing.set(true);
            this.editingId.set(Number(id));
            this.inventory.getInventory(Number(id)).subscribe((item) => {
                this.form.patchValue(item);
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

        void this.router.navigate(['/inventario']);
    }

    submit(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValue = this.form.getRawValue();
        if (this.isEditing()) {
            const id = this.editingId();
            if (!id) {
                return;
            }

            this.inventory.updateInventory(id, formValue).subscribe(() => {
                void this.router.navigate(['/inventario']);
            });
            return;
        }

        this.inventory.createInventory(formValue).subscribe(() => {
            void this.router.navigate(['/inventario']);
        });
    }
}
