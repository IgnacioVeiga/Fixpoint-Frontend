import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Client } from '../models/client.model';
import { ClientsService } from '../service/clients.service';
import { ClientsComponent } from './clients.component';

describe('ClientsComponent', () => {
  let clientServiceSpy: jasmine.SpyObj<ClientsService>;

  const client: Client = {
    id: 1,
    name: 'Alice Doe',
    dni: '12345678',
    phone: '555-100',
    email: 'alice@example.com',
    address: 'Main St',
    notes: ''
  };

  beforeEach(async () => {
    clientServiceSpy = jasmine.createSpyObj<ClientsService>('ClientsService', ['listClients', 'deleteClient']);

    await TestBed.configureTestingModule({
      imports: [ClientsComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: ClientsService, useValue: clientServiceSpy }
      ]
    }).compileComponents();
  });

  it('should render inline error and retry on load failure', () => {
    clientServiceSpy.listClients.and.returnValues(
      throwError(() => ({ error: { message: 'Clients unavailable' } })),
      of([client])
    );

    const fixture = TestBed.createComponent(ClientsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Clients unavailable');

    const retryButton = fixture.nativeElement.querySelector('.btn-inline') as HTMLButtonElement;
    retryButton.click();
    fixture.detectChanges();

    expect(clientServiceSpy.listClients).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.loadError()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Alice Doe');
  });
});
