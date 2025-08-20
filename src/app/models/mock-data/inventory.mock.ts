import { InventoryItem } from '../inventory.model';

export const MOCK_INVENTORY: InventoryItem[] = [
    {
        id: 1,
        name: 'Display LCD 15"',
        componentType: 'Pantalla',
        description: 'Display LCD para notebook',
        condition: 'new',
        quantity: 5,
        location: 'Estante A-1',
        addedAt: new Date().toISOString(),
    },
    {
        id: 2,
        name: 'Placa madre ASUS',
        componentType: 'Motherboard',
        description: 'Placa madre para PC de escritorio',
        condition: 'used',
        source: 'Proveedor XYZ',
        quantity: 3,
        location: 'Estante B-2',
        addedAt: new Date().toISOString(),
    },
    {
        id: 3,
        name: 'Fuente de alimentación 500W',
        componentType: 'PSU',
        description: 'Fuente de poder certificada',
        condition: 'new',
        quantity: 8,
        location: 'Estante C-1',
        addedAt: new Date().toISOString(),
    }
];
