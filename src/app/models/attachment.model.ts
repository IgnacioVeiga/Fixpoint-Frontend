export type AttachmentType = 'photo' | 'contract' | 'invoice' | 'other';

export interface Attachment {
    id: number;
    ticketId: number;
    filename: string;
    filepath: string;
    fileType: AttachmentType;
    uploadedAt: string;
}
