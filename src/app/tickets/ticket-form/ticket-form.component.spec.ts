import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { Client } from '../../models/client.model';
import { InventoryItem } from '../../models/inventory.model';
import { Ticket, TicketStatusDefinition } from '../../models/ticket.model';
import { ClientsService } from '../../service/clients.service';
import { InventoryService } from '../../service/inventory.service';
import { LocaleDateService } from '../../service/locale-date.service';
import { TicketLogsService } from '../../service/ticket-logs.service';
import { TicketPartsService } from '../../service/ticket-parts.service';
import { TicketsService } from '../../service/tickets.service';
import { TicketFormComponent } from './ticket-form.component';

describe('TicketFormComponent', () => {
  let ticketServiceSpy: jasmine.SpyObj<TicketsService>;
  let clientServiceSpy: jasmine.SpyObj<ClientsService>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let ticketLogsServiceSpy: jasmine.SpyObj<TicketLogsService>;
  let ticketPartsServiceSpy: jasmine.SpyObj<TicketPartsService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const client: Client = {
    id: 1,
    name: 'Alice',
    dni: '12345678',
    phone: '555-111',
    email: 'alice@example.com',
    address: 'Main',
    notes: ''
  };

  const inventoryItem: InventoryItem = {
    id: 10,
    name: 'Battery',
    componentType: 'battery',
    description: 'Spare battery',
    condition: 'new',
    source: 'supplier',
    quantity: 5,
    location: 'Shelf B',
    addedAt: '2026-02-14T10:00:00'
  };

  const createdTicket: Ticket = {
    id: 99,
    clientId: 1,
    deviceType: 'Laptop',
    brand: 'Lenovo',
    model: 'T14',
    serialNumber: 'SN-99',
    entryDate: '2026-02-14',
    problemDescription: 'No power',
    status: 'diagnosing',
    needsContract: false,
    contractSigned: false,
    createdBy: 'tech',
    lastUpdated: '2026-02-14T11:00:00'
  };

  const statusDefinitions: TicketStatusDefinition[] = [
    { value: 'received', closed: false, nextStatuses: ['diagnosing', 'cancelled'] },
    { value: 'diagnosing', closed: false, nextStatuses: ['waiting_parts', 'repairing', 'cancelled'] },
    { value: 'waiting_parts', closed: false, nextStatuses: ['repairing', 'cancelled'] },
    { value: 'repairing', closed: false, nextStatuses: ['waiting_parts', 'repaired', 'cancelled'] },
    { value: 'repaired', closed: false, nextStatuses: ['returned', 'cancelled'] },
    { value: 'returned', closed: true, nextStatuses: [] },
    { value: 'cancelled', closed: true, nextStatuses: [] }
  ];

  function configureTestingModule(routeParams: Record<string, string>) {
    ticketServiceSpy = jasmine.createSpyObj<TicketsService>(
      'TicketsService',
      ['getTicket', 'createTicket', 'updateTicket', 'listStatusDefinitions']
    );
    clientServiceSpy = jasmine.createSpyObj<ClientsService>('ClientsService', ['listClients']);
    inventoryServiceSpy = jasmine.createSpyObj<InventoryService>('InventoryService', ['listInventory']);
    ticketLogsServiceSpy = jasmine.createSpyObj<TicketLogsService>('TicketLogsService', ['listTicketLogs', 'createTicketLog']);
    ticketPartsServiceSpy = jasmine.createSpyObj<TicketPartsService>('TicketPartsService', ['listTicketParts', 'createTicketPart']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    clientServiceSpy.listClients.and.returnValue(of([client]));
    inventoryServiceSpy.listInventory.and.returnValue(of([inventoryItem]));
    ticketLogsServiceSpy.listTicketLogs.and.returnValue(of([]));
    ticketPartsServiceSpy.listTicketParts.and.returnValue(of([]));
    ticketServiceSpy.listStatusDefinitions.and.returnValue(of(statusDefinitions));
    ticketServiceSpy.getTicket.and.returnValue(of(createdTicket));
    ticketServiceSpy.createTicket.and.returnValue(of(createdTicket));
    ticketServiceSpy.updateTicket.and.returnValue(of(createdTicket));
    ticketLogsServiceSpy.createTicketLog.and.returnValue(of({
      id: 200,
      ticketId: Number(routeParams['id'] ?? 0),
      description: 'Checked voltage',
      author: 'tech',
      timestamp: '2026-02-14T12:00:00'
    }));
    ticketPartsServiceSpy.createTicketPart.and.returnValue(of({
      id: 300,
      inventoryId: inventoryItem.id,
      quantity: 2,
      note: 'Installed replacement'
    }));

    TestBed.configureTestingModule({
      imports: [TicketFormComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        LocaleDateService,
        { provide: ActivatedRoute, useValue: { snapshot: { params: routeParams } } },
        { provide: Router, useValue: routerSpy },
        { provide: TicketsService, useValue: ticketServiceSpy },
        { provide: ClientsService, useValue: clientServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: TicketLogsService, useValue: ticketLogsServiceSpy },
        { provide: TicketPartsService, useValue: ticketPartsServiceSpy }
      ]
    });
  }

  it('should create a new ticket and navigate to detail page', async () => {
    configureTestingModule({});
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(TicketFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(ticketServiceSpy.listStatusDefinitions).toHaveBeenCalled();
    component.form.patchValue({
      clientId: client.id,
      deviceType: 'Laptop',
      brand: 'Lenovo',
      model: 'T14',
      serialNumber: 'SN-99',
      entryDate: '2026-02-14',
      problemDescription: 'No power',
      status: 'diagnosing',
      needsContract: false,
      contractSigned: false,
      createdBy: 'tech'
    });

    component.submit();

    expect(ticketServiceSpy.createTicket).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tickets', createdTicket.id]);
  });

  it('should load editing context and add log and part', async () => {
    configureTestingModule({ id: '55' });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(TicketFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(ticketServiceSpy.listStatusDefinitions).toHaveBeenCalled();
    expect(component.isEditing()).toBeTrue();
    expect(component.editingId()).toBe(55);
    expect(ticketServiceSpy.getTicket).toHaveBeenCalledWith(55);
    expect(ticketLogsServiceSpy.listTicketLogs).toHaveBeenCalledWith(55);
    expect(ticketPartsServiceSpy.listTicketParts).toHaveBeenCalledWith(55);

    component.logForm.patchValue({
      description: 'Checked voltage',
      author: 'tech'
    });
    component.addLog();

    expect(ticketLogsServiceSpy.createTicketLog).toHaveBeenCalledWith(55, {
      description: 'Checked voltage',
      author: 'tech'
    });
    expect(component.ticketLogs().length).toBe(1);

    component.partForm.patchValue({
      inventoryId: inventoryItem.id,
      quantity: 2,
      note: 'Installed replacement'
    });
    component.addPart();

    expect(ticketPartsServiceSpy.createTicketPart).toHaveBeenCalledWith(55, {
      inventoryId: inventoryItem.id,
      quantity: 2,
      note: 'Installed replacement'
    });
    expect(component.ticketParts().length).toBe(1);
    expect(component.inventoryItems()[0].quantity).toBe(3);
  });
});
