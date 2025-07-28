import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-inventory-form',
    templateUrl: './inventory-form.component.html',
    styleUrls: ['./inventory-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule]
})
export class InventoryFormComponent {
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
    }

    submit() {
        if (this.form.valid) {
            alert('Componente guardado: ' + JSON.stringify(this.form.value, null, 2));
        } else {
            this.form.markAllAsTouched();
        }
    }
}
