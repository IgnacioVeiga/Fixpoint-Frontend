export type TicketStatus = 'received' | 'diagnosing' | 'waiting_parts' | 'repairing' | 'repaired' | 'returned' | 'cancelled';

export interface Ticket {
    id: number;
    clientId: number;
    deviceType: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    entryDate: string;
    problemDescription?: string;
    status: TicketStatus;
    needsContract: boolean;
    contractSigned: boolean;
    createdBy?: string;
    lastUpdated: string;
}
