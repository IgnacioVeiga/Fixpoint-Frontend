import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-client-form',
    templateUrl: './client-form.component.html',
    styleUrls: ['./client-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule]
})
export class ClientFormComponent {
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
    }

    submit() {
        if (this.form.valid) {
            alert('Cliente guardado: ' + JSON.stringify(this.form.value, null, 2));
        } else {
            this.form.markAllAsTouched();
        }
    }
}
