import { Attachment } from '../attachment.model';
import { DashboardStats, FileFolder } from '../dashboard.model';

const attachment = (
    id: number,
    ticketId: number,
    filename: string,
    filepath: string,
    fileType: Attachment['fileType'],
    fileFormat: string,
    uploadedAt: string,
    tag?: string
): Attachment => ({
    id,
    ticketId,
    filename,
    filepath,
    fileType,
    fileFormat,
    tag,
    uploadedAt
});

export const MOCK_FILE_STRUCTURE: FileFolder[] = [
    {
        name: 'Documentos',
        path: '/document',
        files: [
            attachment(1, 18, 'presupuesto-smart-tv.pdf', '/document/presupuesto-smart-tv.pdf', 'document', 'pdf', '2026-03-10T10:30:00Z', 'Presupuesto'),
            attachment(2, 21, 'manual-instalacion-router.docx', '/document/manual-instalacion-router.docx', 'document', 'docx', '2026-03-09T15:30:00Z', 'Manual')
        ],
        subfolders: []
    },
    {
        name: 'Planillas',
        path: '/spreadsheet',
        files: [
            attachment(3, 22, 'stock-repuestos-marzo.csv', '/spreadsheet/stock-repuestos-marzo.csv', 'spreadsheet', 'csv', '2026-03-11T11:00:00Z', 'Stock')
        ],
        subfolders: [
            {
                name: 'Costos',
                path: '/spreadsheet/costos',
                files: [
                    attachment(4, 22, 'costos-servicio-impresoras.xlsx', '/spreadsheet/costos/costos-servicio-impresoras.xlsx', 'spreadsheet', 'xlsx', '2026-03-08T09:30:00Z', 'Costos')
                ],
                subfolders: []
            }
        ]
    },
    {
        name: 'Imagenes',
        path: '/image',
        files: [],
        subfolders: [
            {
                name: 'Escaneos',
                path: '/image/escaneos',
                files: [
                    attachment(5, 18, 'placa-fuente-scan.png', '/image/escaneos/placa-fuente-scan.png', 'image', 'png', '2026-03-10T10:35:00Z', 'Escaneo'),
                    attachment(6, 21, 'conector-red-detalle.jpg', '/image/escaneos/conector-red-detalle.jpg', 'image', 'jpg', '2026-03-09T14:20:00Z', 'Foto')
                ],
                subfolders: []
            },
            {
                name: 'Esquemas',
                path: '/image/esquemas',
                files: [
                    attachment(7, 25, 'diagrama-senal-router.webp', '/image/esquemas/diagrama-senal-router.webp', 'image', 'webp', '2026-03-10T16:45:00Z', 'Esquema')
                ],
                subfolders: []
            }
        ]
    },
    {
        name: 'Backups',
        path: '/archive',
        files: [
            attachment(8, 25, 'backup-ticket-router.zip', '/archive/backup-ticket-router.zip', 'archive', 'zip', '2026-03-07T08:10:00Z', 'Backup')
        ],
        subfolders: []
    }
];

export const MOCK_RECENT_FILES: Attachment[] = MOCK_FILE_STRUCTURE
    .flatMap((folder) => [
        ...folder.files,
        ...folder.subfolders.flatMap((subfolder) => subfolder.files)
    ])
    .sort((left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime());

export const MOCK_DASHBOARD_STATS: DashboardStats = {
    ticketsByStatus: {
        received: 9,
        diagnosing: 6,
        waiting_parts: 4,
        repairing: 7,
        repaired: 13,
        returned: 11,
        cancelled: 1
    },
    ticketsByMonth: [
        { month: 'Oct', count: 16 },
        { month: 'Nov', count: 18 },
        { month: 'Dic', count: 21 },
        { month: 'Ene', count: 19 },
        { month: 'Feb', count: 24 },
        { month: 'Mar', count: 27 }
    ],
    clientGrowth: [
        { month: 'Oct', total: 54 },
        { month: 'Nov', total: 61 },
        { month: 'Dic', total: 69 },
        { month: 'Ene', total: 74 },
        { month: 'Feb', total: 82 },
        { month: 'Mar', total: 91 }
    ],
    partsUsage: [
        { name: 'Fuente universal', count: 11 },
        { name: 'Flex de display', count: 8 },
        { name: 'Conector DC', count: 7 },
        { name: 'Ventilador 80mm', count: 5 },
        { name: 'Modulo Wi-Fi', count: 4 }
    ],
    topClients: [
        { name: 'Hospital Central', ticketCount: 9 },
        { name: 'Libreria Sur', ticketCount: 6 },
        { name: 'Juan Perez', ticketCount: 4 },
        { name: 'Marina Costa', ticketCount: 4 },
        { name: 'RedNet SRL', ticketCount: 3 }
    ],
    storage: {
        usedBytes: 41287680,
        fileCount: 28,
        totalBytes: 268435456,
        availableBytes: 227147776,
        usagePercent: 15.38,
        source: 'configured'
    },
    recentFiles: MOCK_RECENT_FILES
};
