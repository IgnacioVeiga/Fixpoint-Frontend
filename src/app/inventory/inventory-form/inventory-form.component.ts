import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../service/inventory.service';
import { InventoryItem } from '../../models/inventory.model';

@Component({
    selector: 'app-inventory-form',
    templateUrl: './inventory-form.component.html',
    styleUrls: ['./inventory-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule]
})
export class InventoryFormComponent {
    private inventory = inject(InventoryService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    isEditing = signal(false);
    editingId = signal<number | null>(null);

    conditions = [
        { value: 'new', label: 'Nuevo' },
        { value: 'used', label: 'Usado' },
        { value: 'damaged', label: 'Dañado' }
    ];

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            componentType: [''],
            description: [''],
            condition: ['new', Validators.required],
            source: [''],
            quantity: [1, [Validators.required, Validators.min(1)]],
            location: ['']
        });

        // Check if we're editing an existing item
        const id = this.route.snapshot.params['id'];
        if (id && id !== 'nuevo') {
            this.isEditing.set(true);
            this.editingId.set(Number(id));
            this.inventory.getInventory(Number(id)).subscribe(item => {
                this.form.patchValue(item);
            });
        }
    }

    submit() {
        if (this.form.valid) {
            const formValue = this.form.value;
            
            if (this.isEditing()) {
                const id = this.editingId()!;
                this.inventory.updateInventory(id, { ...formValue, id }).subscribe(() => {
                    this.router.navigate(['/inventario']);
                });
            } else {
                this.inventory.createInventory(formValue).subscribe(() => {
                    this.router.navigate(['/inventario']);
                });
            }
        } else {
            this.form.markAllAsTouched();
        }
    }
}
