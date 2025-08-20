import { Client } from '../client.model';

export const MOCK_CLIENTS: Client[] = [
    {
        id: 1,
        name: 'Juan Pérez',
        dni: '12345678',
        phone: '1112345678',
        email: 'juan@mail.com',
        address: 'Av. Siempreviva 123',
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: 'María García',
        dni: '87654321',
        phone: '1187654321',
        email: 'maria@mail.com',
        address: 'Calle Falsa 123',
        notes: 'Cliente frecuente',
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Carlos López',
        dni: '45678912',
        phone: '1145678912',
        address: 'Diagonal 123',
        notes: 'Prefiere contacto por teléfono',
        createdAt: new Date().toISOString()
    }
];
