import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentsService } from '../../service/attachments.service';
import { Attachment, AttachmentType } from '../../models/attachment.model';

@Component({
    selector: 'app-attachment-uploader',
    templateUrl: './attachment-uploader.component.html',
    styleUrls: ['./attachment-uploader.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule]
})
export class AttachmentUploaderComponent {
    @Input() ticketId?: number;
    @Input() maxFileSize = 10 * 1024 * 1024; // 10mb
    @Input() allowedTypes: AttachmentType[] = ['photo', 'contract', 'invoice', 'other'];
    @Output() attachmentsChange = new EventEmitter<Attachment[]>();

    attachments = signal<Attachment[]>([]);
    uploading = signal(false);
    dragOver = signal(false);

    fileTypes = {
        'photo': { icon: '📷', accept: 'image/*' },
        'contract': { icon: '📄', accept: '.pdf' },
        'invoice': { icon: '🧾', accept: '.pdf' },
        'other': { icon: '📎', accept: '.pdf,image/*' }
    };

    currentPreview = signal<{ url: string, type: string } | null>(null);

    get acceptedFileTypes(): string {
        return this.allowedTypes
            .map(type => this.fileTypes[type]?.accept || '')
            .filter(accept => accept !== '')
            .join(',');
    }

    totalSize = computed(() => {
        return this.attachments().reduce((acc, curr) => {
            // Tamaño simulado para los archivos mockup
            return acc + 1024 * 1024; // 1MB por archivo
        }, 0);
    });

    constructor(private attachmentService: AttachmentsService) { }

    ngOnInit() {
        if (this.ticketId) {
            this.loadAttachments();
        }
    }

    private loadAttachments() {
        if (!this.ticketId) return;

        this.attachmentService.listAttachments(this.ticketId).subscribe(
            attachments => this.attachments.set(attachments)
        );
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver.set(true);
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver.set(false);
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver.set(false);

        const files = event.dataTransfer?.files;
        if (files) {
            this.handleFiles(files);
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.handleFiles(input.files);
        }
    }

    private async handleFiles(files: FileList) {
        this.uploading.set(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validar tamaño
            if (file.size > this.maxFileSize) {
                alert(`El archivo ${file.name} excede el tamaño máximo permitido de ${this.maxFileSize / 1024 / 1024}MB`);
                continue;
            }

            // Validar tipo
            const type = this.getFileType(file);
            if (!type) {
                alert(`Tipo de archivo no permitido: ${file.name}`);
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            if (this.ticketId) {
                formData.append('ticketId', this.ticketId.toString());
            }

            this.attachmentService.uploadAttachment(formData).subscribe({
                next: (attachment) => {
                    this.attachments.update(curr => [...curr, attachment]);
                    this.attachmentsChange.emit(this.attachments());
                },
                error: (error) => {
                    console.error('Error al subir archivo:', error);
                    alert('Error al subir el archivo ' + file.name);
                }
            });
        }

        this.uploading.set(false);
    }

    private getFileType(file: File): AttachmentType | null {
        const isPDF = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');

        if (isPDF && this.allowedTypes.includes('contract')) return 'contract';
        if (isPDF && this.allowedTypes.includes('invoice')) return 'invoice';
        if (isImage && this.allowedTypes.includes('photo')) return 'photo';
        if ((isPDF || isImage) && this.allowedTypes.includes('other')) return 'other';

        return null;
    }

    previewFile(attachment: Attachment) {
        // En un caso real, acá se obtiene la URL del archivo del servidor
        const mockUrl = `data:${attachment.filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'};base64,`;
        this.currentPreview.set({
            url: mockUrl,
            type: attachment.filename.endsWith('.pdf') ? 'pdf' : 'image'
        });
    }

    closePreview() {
        this.currentPreview.set(null);
    }

    deleteAttachment(attachment: Attachment, event: Event) {
        event.stopPropagation();
        if (confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
            this.attachmentService.deleteAttachment(attachment.id).subscribe({
                next: () => {
                    this.attachments.update(curr => curr.filter(a => a.id !== attachment.id));
                    this.attachmentsChange.emit(this.attachments());
                },
                error: (error) => {
                    console.error('Error al eliminar archivo:', error);
                    alert('Error al eliminar el archivo');
                }
            });
        }
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }
}
