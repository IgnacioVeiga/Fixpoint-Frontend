import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { TicketsService } from './tickets.service';
import { SaveTicketRequest, Ticket } from '../models/ticket.model';

describe('TicketsService', () => {
  let service: TicketsService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const baseTicket: Ticket = {
    id: 1,
    clientId: 11,
    deviceType: 'Laptop',
    brand: 'Lenovo',
    model: 'T14',
    serialNumber: 'SN-01',
    entryDate: '2026-02-14',
    problemDescription: 'No power',
    status: 'diagnosing',
    needsContract: false,
    contractSigned: false,
    createdBy: 'tech-1',
    lastUpdated: '2026-02-14T10:00:00Z'
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [TicketsService, { provide: ApiService, useValue: apiSpy }]
    });

    service = TestBed.inject(TicketsService);
  });

  it('should request ticket list from the API endpoint', (done) => {
    apiSpy.get.and.returnValue(of([baseTicket]));

    service.listTickets().subscribe(tickets => {
      expect(tickets).toEqual([baseTicket]);
      expect(apiSpy.get).toHaveBeenCalledWith('tickets');
      done();
    });
  });

  it('should call create endpoint with payload and return created ticket', (done) => {
    const payload: SaveTicketRequest = {
      clientId: baseTicket.clientId,
      deviceType: baseTicket.deviceType,
      brand: baseTicket.brand,
      model: baseTicket.model,
      serialNumber: baseTicket.serialNumber,
      entryDate: baseTicket.entryDate,
      problemDescription: baseTicket.problemDescription,
      status: baseTicket.status,
      needsContract: baseTicket.needsContract,
      contractSigned: baseTicket.contractSigned,
      createdBy: baseTicket.createdBy
    };

    const created: Ticket = { ...baseTicket, id: 15 };
    apiSpy.post.and.returnValue(of(created));

    service.createTicket(payload).subscribe(ticket => {
      expect(ticket).toEqual(created);
      expect(apiSpy.post).toHaveBeenCalledWith('tickets', payload);
      done();
    });
  });

  it('should propagate API errors without swallowing them', (done) => {
    const failure = new Error('Network failure');
    apiSpy.get.and.returnValue(throwError(() => failure));

    service.listTickets().subscribe({
      next: () => fail('Expected an error but got success response'),
      error: err => {
        expect(err).toBe(failure);
        done();
      }
    });
  });
});
