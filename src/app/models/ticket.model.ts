export type TicketStatus = 'received' | 'diagnosing' | 'waiting_parts' | 'repairing' | 'repaired' | 'returned' | 'cancelled';

export interface TicketStatusDefinition {
    value: TicketStatus;
    closed: boolean;
    nextStatuses: TicketStatus[];
}

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

export type SaveTicketRequest = Omit<Ticket, 'id' | 'lastUpdated'> & {
    lastUpdated?: string;
};
