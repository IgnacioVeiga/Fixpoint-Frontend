import { Ticket } from '../ticket.model';
import { Client } from '../client.model';
import { Attachment } from '../attachment.model';

export interface DashboardStats {
    ticketsByStatus: { [key: string]: number };
    ticketsByMonth: { month: string; count: number }[];
    clientGrowth: { month: string; total: number }[];
    partsUsage: { name: string; count: number }[];
    topClients: { name: string; ticketCount: number }[];
    recentFiles: Attachment[];
}

export interface FileFolder {
    name: string;
    path: string;
    files: Attachment[];
    subfolders: FileFolder[];
}

export const MOCK_FILE_STRUCTURE: FileFolder[] = [
    {
        name: 'Contratos',
        path: '/contratos',
        files: [
            {
                id: 1,
                ticketId: 1,
                filename: 'contrato-reparacion-001.pdf',
                filepath: '/contratos/contrato-reparacion-001.pdf',
                fileType: 'contract',
                uploadedAt: '2025-08-20T10:30:00Z'
            },
            {
                id: 2,
                ticketId: 2,
                filename: 'contrato-reparacion-002.pdf',
                filepath: '/contratos/contrato-reparacion-002.pdf',
                fileType: 'contract',
                uploadedAt: '2025-08-19T15:30:00Z'
            }
        ],
        subfolders: []
    },
    {
        name: 'Facturas',
        path: '/facturas',
        files: [
            {
                id: 3,
                ticketId: 1,
                filename: 'factura-repuestos-001.pdf',
                filepath: '/facturas/factura-repuestos-001.pdf',
                fileType: 'invoice',
                uploadedAt: '2025-08-20T11:00:00Z'
            }
        ],
        subfolders: [
            {
                name: '2025',
                path: '/facturas/2025',
                files: [
                    {
                        id: 4,
                        ticketId: 3,
                        filename: 'factura-repuestos-003.pdf',
                        filepath: '/facturas/2025/factura-repuestos-003.pdf',
                        fileType: 'invoice',
                        uploadedAt: '2025-08-18T09:30:00Z'
                    }
                ],
                subfolders: []
            }
        ]
    },
    {
        name: 'Fotos',
        path: '/fotos',
        files: [],
        subfolders: [
            {
                name: 'Diagnósticos',
                path: '/fotos/diagnosticos',
                files: [
                    {
                        id: 5,
                        ticketId: 1,
                        filename: 'diagnostico-001.jpg',
                        filepath: '/fotos/diagnosticos/diagnostico-001.jpg',
                        fileType: 'photo',
                        uploadedAt: '2025-08-20T10:35:00Z'
                    },
                    {
                        id: 6,
                        ticketId: 2,
                        filename: 'diagnostico-002.jpg',
                        filepath: '/fotos/diagnosticos/diagnostico-002.jpg',
                        fileType: 'photo',
                        uploadedAt: '2025-08-19T14:20:00Z'
                    }
                ],
                subfolders: []
            },
            {
                name: 'Reparaciones',
                path: '/fotos/reparaciones',
                files: [
                    {
                        id: 7,
                        ticketId: 1,
                        filename: 'reparacion-001.jpg',
                        filepath: '/fotos/reparaciones/reparacion-001.jpg',
                        fileType: 'photo',
                        uploadedAt: '2025-08-20T16:45:00Z'
                    }
                ],
                subfolders: []
            }
        ]
    }
];

// Lista plana de los últimos archivos para vista rápida
export const MOCK_RECENT_FILES: Attachment[] = [
    ...MOCK_FILE_STRUCTURE[2].subfolders[0].files,
    ...MOCK_FILE_STRUCTURE[0].files,
    ...MOCK_FILE_STRUCTURE[1].files,
    ...MOCK_FILE_STRUCTURE[2].subfolders[1].files
].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

export const MOCK_DASHBOARD_STATS: DashboardStats = {
    ticketsByStatus: {
        'received': 15,
        'diagnosing': 8,
        'waiting_parts': 12,
        'repairing': 5,
        'repaired': 25,
        'returned': 18,
        'cancelled': 3
    },
    ticketsByMonth: [
        { month: 'Ene', count: 28 },
        { month: 'Feb', count: 32 },
        { month: 'Mar', count: 37 },
        { month: 'Abr', count: 35 },
        { month: 'May', count: 42 },
        { month: 'Jun', count: 38 }
    ],
    clientGrowth: [
        { month: 'Ene', total: 120 },
        { month: 'Feb', total: 145 },
        { month: 'Mar', total: 168 },
        { month: 'Abr', total: 189 },
        { month: 'May', total: 210 },
        { month: 'Jun', total: 235 }
    ],
    partsUsage: [
        { name: 'Display LCD', count: 45 },
        { name: 'Batería', count: 38 },
        { name: 'Placa madre', count: 15 },
        { name: 'Fuente', count: 22 },
        { name: 'Memoria RAM', count: 30 }
    ],
    topClients: [
        { name: 'Empresa ABC', ticketCount: 15 },
        { name: 'Juan Pérez', ticketCount: 8 },
        { name: 'María García', ticketCount: 7 },
        { name: 'TechStore', ticketCount: 6 },
        { name: 'Carlos López', ticketCount: 5 }
    ],
    recentFiles: [
        {
            id: 1,
            ticketId: 1,
            filename: 'contrato-reparacion.pdf',
            filepath: '/contratos/001.pdf',
            fileType: 'contract',
            uploadedAt: '2025-08-20T10:30:00Z'
        },
        {
            id: 2,
            ticketId: 1,
            filename: 'foto-diagnóstico.jpg',
            filepath: '/fotos/002.jpg',
            fileType: 'photo',
            uploadedAt: '2025-08-20T10:35:00Z'
        },
        {
            id: 3,
            ticketId: 2,
            filename: 'factura-repuestos.pdf',
            filepath: '/facturas/003.pdf',
            fileType: 'invoice',
            uploadedAt: '2025-08-20T11:00:00Z'
        }
    ]
};
