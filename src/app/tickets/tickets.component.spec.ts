import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { TicketsService } from '../service/tickets.service';
import { TicketsComponent } from './tickets.component';

describe('TicketsComponent', () => {
  let ticketServiceSpy: jasmine.SpyObj<TicketsService>;

  const ticket: Ticket = {
    id: 1,
    clientId: 10,
    deviceType: 'Laptop',
    brand: 'Lenovo',
    model: 'T14',
    serialNumber: 'SN-1',
    entryDate: '2026-02-14',
    problemDescription: 'No power',
    status: 'diagnosing',
    needsContract: false,
    contractSigned: false,
    createdBy: 'tech',
    lastUpdated: '2026-02-14T10:00:00'
  };

  beforeEach(async () => {
    ticketServiceSpy = jasmine.createSpyObj<TicketsService>('TicketsService', ['listTickets', 'deleteTicket']);

    await TestBed.configureTestingModule({
      imports: [TicketsComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: TicketsService, useValue: ticketServiceSpy }
      ]
    }).compileComponents();
  });

  it('should keep loading state until list endpoint emits', () => {
    const subject = new Subject<Ticket[]>();
    ticketServiceSpy.listTickets.and.returnValue(subject.asObservable());

    const fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Loading data...');

    subject.next([ticket]);
    subject.complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('#1');
  });

  it('should show error and retry loading data', () => {
    ticketServiceSpy.listTickets.and.returnValues(
      throwError(() => ({ error: { message: 'Load failed' } })),
      of([ticket])
    );

    const fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Load failed');
    const retryButton = fixture.nativeElement.querySelector('.btn-inline') as HTMLButtonElement;
    expect(retryButton).toBeTruthy();

    retryButton.click();
    fixture.detectChanges();

    expect(ticketServiceSpy.listTickets).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.loadError()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('#1');
  });
});
