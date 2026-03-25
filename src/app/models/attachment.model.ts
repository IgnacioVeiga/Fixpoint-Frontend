import {
    Archive,
    FileText,
    type LucideIconData,
    Image as ImageIcon,
    Paperclip,
    Sheet as SheetIcon
} from 'lucide-angular';

export type AttachmentType = 'image' | 'document' | 'spreadsheet' | 'archive' | 'other';

export interface Attachment {
    id: number;
    ticketId: number;
    filename: string;
    filepath: string;
    fileType: AttachmentType;
    fileFormat: string;
    fileSizeBytes?: number | null;
    tag?: string | null;
    uploadedAt: string;
}

export interface AttachmentUploadDraft {
    id: string;
    file: File;
    fileType: AttachmentType;
    fileFormat: string;
    tag: string;
}

type AttachmentTypeDefinition = {
    icon: LucideIconData;
    label: string;
    folderLabel: string;
    accept: string[];
    tagSuggestions: string[];
};

export const ATTACHMENT_TYPE_DEFINITIONS: Record<AttachmentType, AttachmentTypeDefinition> = {
    image: {
        icon: ImageIcon,
        label: 'Imagen',
        folderLabel: 'Imagenes',
        accept: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff', '.svg'],
        tagSuggestions: ['Foto', 'Escaneo', 'Esquema', 'Instrucciones']
    },
    document: {
        icon: FileText,
        label: 'Documento',
        folderLabel: 'Documentos',
        accept: ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'],
        tagSuggestions: ['Diagnostico', 'Presupuesto', 'Contrato', 'Factura', 'Manual']
    },
    spreadsheet: {
        icon: SheetIcon,
        label: 'Planilla',
        folderLabel: 'Planillas',
        accept: ['.xls', '.xlsx', '.csv', '.ods'],
        tagSuggestions: ['Stock', 'Costos', 'Seguimiento']
    },
    archive: {
        icon: Archive,
        label: 'Archive',
        folderLabel: 'Backups',
        accept: ['.zip', '.rar', '.7z'],
        tagSuggestions: ['Backup', 'Entrega', 'Adjuntos']
    },
    other: {
        icon: Paperclip,
        label: 'Otro',
        folderLabel: 'Otros',
        accept: [],
        tagSuggestions: ['Referencia']
    }
};

const FORMAT_TO_TYPE: Record<string, AttachmentType> = Object.entries(ATTACHMENT_TYPE_DEFINITIONS).reduce(
    (result, [type, definition]) => {
        for (const extension of definition.accept) {
            result[extension.replace('.', '').toLowerCase()] = type as AttachmentType;
        }
        return result;
    },
    {} as Record<string, AttachmentType>
);

export function resolveAttachmentAccept(): string {
    return Array.from(
        new Set(Object.values(ATTACHMENT_TYPE_DEFINITIONS).flatMap((definition) => definition.accept))
    ).join(',');
}

export function detectAttachmentMetadata(filename: string): { fileType: AttachmentType; fileFormat: string } | null {
    const extensionSeparator = filename.lastIndexOf('.');
    if (extensionSeparator < 0 || extensionSeparator === filename.length - 1) {
        return null;
    }

    const fileFormat = filename.slice(extensionSeparator + 1).trim().toLowerCase();
    const fileType = FORMAT_TO_TYPE[fileFormat];
    if (!fileType) {
        return null;
    }

    return { fileType, fileFormat };
}

export function getAttachmentTypeLabel(type: AttachmentType): string {
    return ATTACHMENT_TYPE_DEFINITIONS[type]?.label ?? ATTACHMENT_TYPE_DEFINITIONS.other.label;
}

export function getAttachmentFolderLabel(type: AttachmentType): string {
    return ATTACHMENT_TYPE_DEFINITIONS[type]?.folderLabel ?? ATTACHMENT_TYPE_DEFINITIONS.other.folderLabel;
}

export function getAttachmentTypeIcon(type: AttachmentType): LucideIconData {
    return ATTACHMENT_TYPE_DEFINITIONS[type]?.icon ?? ATTACHMENT_TYPE_DEFINITIONS.other.icon;
}

export function getAttachmentTagSuggestions(type: AttachmentType): string[] {
    return ATTACHMENT_TYPE_DEFINITIONS[type]?.tagSuggestions ?? ATTACHMENT_TYPE_DEFINITIONS.other.tagSuggestions;
}

export function formatAttachmentFormat(fileFormat: string): string {
    return fileFormat.toUpperCase();
}
