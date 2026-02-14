export type InventoryCondition = 'new' | 'used' | 'damaged';

export interface InventoryItem {
    id: number;
    name: string;
    componentType?: string;
    description?: string;
    condition: InventoryCondition;
    source?: string;
    quantity: number;
    location?: string;
    addedAt: string;
}

export type SaveInventoryRequest = Omit<InventoryItem, 'id' | 'addedAt'>;
