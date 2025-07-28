export interface Client {
    id: number;
    name: string;
    dni?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    createdAt: string;
}
