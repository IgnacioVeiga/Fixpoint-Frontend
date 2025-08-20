import { Ticket } from '../ticket.model';

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
