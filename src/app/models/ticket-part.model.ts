export interface TicketPart {
    id: number;
    inventoryId: number;
    inventoryName?: string;
    quantity: number;
    note?: string;
}

export interface AddTicketPartRequest {
    inventoryId: number;
    quantity: number;
    note?: string;
}
