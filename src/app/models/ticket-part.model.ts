export interface TicketPart {
    id: number;
    ticketId: number;
    inventoryId: number;
    quantity: number;
    note?: string;
}
