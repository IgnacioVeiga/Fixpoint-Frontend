import { TicketLog } from '../ticket-log.model';
import { TicketPart } from '../ticket-part.model';
import { Ticket, TicketStatusDefinition } from '../ticket.model';

export const MOCK_TICKET_STATUS_DEFINITIONS: TicketStatusDefinition[] = [
    { value: 'received', closed: false, nextStatuses: ['diagnosing', 'cancelled'] },
    { value: 'diagnosing', closed: false, nextStatuses: ['waiting_parts', 'repairing', 'cancelled'] },
    { value: 'waiting_parts', closed: false, nextStatuses: ['repairing', 'cancelled'] },
    { value: 'repairing', closed: false, nextStatuses: ['waiting_parts', 'repaired', 'cancelled'] },
    { value: 'repaired', closed: false, nextStatuses: ['returned', 'cancelled'] },
    { value: 'returned', closed: true, nextStatuses: [] },
    { value: 'cancelled', closed: true, nextStatuses: [] }
];

export const MOCK_TICKETS: Ticket[] = [
    {
        id: 1,
        clientId: 1,
        deviceType: 'Televisor',
        brand: 'Samsung',
        model: 'Q60',
        serialNumber: 'SN123',
        entryDate: new Date().toISOString(),
        problemDescription: 'No enciende',
        status: 'diagnosing',
        needsContract: false,
        contractSigned: false,
        createdBy: 'admin',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 2,
        clientId: 2,
        deviceType: 'Celular',
        brand: 'Motorola',
        model: 'G8',
        serialNumber: 'SN456',
        entryDate: new Date().toISOString(),
        problemDescription: 'Pantalla rota',
        status: 'waiting_parts',
        needsContract: false,
        contractSigned: false,
        createdBy: 'admin',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 3,
        clientId: 3,
        deviceType: 'Notebook',
        brand: 'Dell',
        model: 'Inspiron 15',
        serialNumber: 'SN789',
        entryDate: new Date().toISOString(),
        problemDescription: 'No carga la batería',
        status: 'repairing',
        needsContract: true,
        contractSigned: true,
        createdBy: 'admin',
        lastUpdated: new Date().toISOString()
    }
];

export const MOCK_TICKET_LOGS_BY_TICKET: Record<number, TicketLog[]> = {
    1: [
        {
            id: 101,
            ticketId: 1,
            timestamp: '2026-03-10T10:42:00Z',
            description: 'Se abrio el equipo y se detecto fuente sin salida estable.',
            author: 'Taller'
        },
        {
            id: 102,
            ticketId: 1,
            timestamp: '2026-03-10T11:18:00Z',
            description: 'Se adjunto escaneo de la placa para validar componente dañado.',
            author: 'Tecnico'
        }
    ],
    2: [
        {
            id: 201,
            ticketId: 2,
            timestamp: '2026-03-09T14:33:00Z',
            description: 'Se confirmo modulo de display quebrado y se pidio repuesto.',
            author: 'Recepcion'
        }
    ],
    3: [
        {
            id: 301,
            ticketId: 3,
            timestamp: '2026-03-11T09:15:00Z',
            description: 'Se reemplazo flex de pantalla y se actualizaron costos en la planilla.',
            author: 'Tecnico'
        },
        {
            id: 302,
            ticketId: 3,
            timestamp: '2026-03-11T12:05:00Z',
            description: 'Se genero backup de configuracion previo a la entrega.',
            author: 'Taller'
        }
    ]
};

export const MOCK_TICKET_PARTS_BY_TICKET: Record<number, TicketPart[]> = {
    2: [
        {
            id: 401,
            inventoryId: 1,
            inventoryName: 'Display LCD 15"',
            quantity: 1,
            note: 'Reservado para cambio de modulo roto'
        }
    ],
    3: [
        {
            id: 402,
            inventoryId: 1,
            inventoryName: 'Display LCD 15"',
            quantity: 1,
            note: 'Instalado y probado'
        },
        {
            id: 403,
            inventoryId: 3,
            inventoryName: 'Fuente de alimentación 500W',
            quantity: 1,
            note: 'Usada para validacion de carga'
        }
    ]
};
