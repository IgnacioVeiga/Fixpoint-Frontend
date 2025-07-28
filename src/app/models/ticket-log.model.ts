export interface TicketLog {
    id: number;
    ticketId: number;
    timestamp: string;
    description: string;
    author?: string;
}
