import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {
  ATTACHMENT_TYPE_DEFINITIONS,
  Attachment,
  AttachmentType,
  AttachmentUploadDraft,
  detectAttachmentMetadata,
  formatAttachmentFormat,
  getAttachmentTagSuggestions,
  getAttachmentTypeIcon,
  getAttachmentTypeLabel
} from '../../models/attachment.model';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';
import { AttachmentsService } from '../../service/attachments.service';
import { LocaleDateService } from '../../service/locale-date.service';
import { UI_ICONS } from '../ui-icons';

@Component({
  selector: 'app-attachment-uploader',
  templateUrl: './attachment-uploader.component.html',
  styleUrls: ['./attachment-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, LucideAngularModule]
})
export class AttachmentUploaderComponent implements OnChanges {
  @Input() ticketId?: number;
  @Input() maxFileSize = 10 * 1024 * 1024;
  @Input() allowedTypes: AttachmentType[] = ['image', 'document', 'spreadsheet', 'archive'];
  @Output() attachmentsChange = new EventEmitter<Attachment[]>();

  readonly attachments = signal<Attachment[]>([]);
  readonly pendingUploads = signal<AttachmentUploadDraft[]>([]);
  readonly uploading = signal(false);
  readonly dragOver = signal(false);
  readonly uploadIcon = UI_ICONS.upload;

  constructor(
    private readonly attachmentService: AttachmentsService,
    private readonly localeDate: LocaleDateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticketId']) {
      this.loadAttachments();
    }
  }

  get acceptedFileTypes(): string {
    return Array.from(
      new Set(
        this.allowedTypes.flatMap((type) => ATTACHMENT_TYPE_DEFINITIONS[type]?.accept ?? [])
      )
    ).join(',');
  }

  get allowedTypesSummary(): string {
    return this.allowedTypes
      .map((type) => {
        const definition = ATTACHMENT_TYPE_DEFINITIONS[type];
        const formats = definition.accept.map((extension) => extension.replace('.', '').toUpperCase()).join(', ');
        return `${definition.label}: ${formats}`;
      })
      .join(' · ');
  }

  getFileTypeIcon(type: AttachmentType): LucideIconData {
    return getAttachmentTypeIcon(type);
  }

  getFileTypeLabel(type: AttachmentType): string {
    return getAttachmentTypeLabel(type);
  }

  getTagSuggestions(type: AttachmentType): string[] {
    return getAttachmentTagSuggestions(type);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  formatAttachmentDate(value: string): string {
    return this.localeDate.formatDateTime(value);
  }

  formatAttachmentFormat(value: string): string {
    return formatAttachmentFormat(value);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.queueFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.queueFiles(input.files);
      input.value = '';
    }
  }

  updateDraftTag(id: string, value: string): void {
    this.pendingUploads.update((drafts) =>
      drafts.map((draft) => draft.id === id ? { ...draft, tag: value } : draft)
    );
  }

  applySuggestedTag(id: string, suggestion: string): void {
    this.updateDraftTag(id, suggestion);
  }

  removePendingUpload(id: string): void {
    this.pendingUploads.update((drafts) => drafts.filter((draft) => draft.id !== id));
  }

  clearPendingUploads(): void {
    this.pendingUploads.set([]);
  }

  async uploadPendingFiles(): Promise<void> {
    if (!this.ticketId) {
      alert('Primero debés guardar el ticket para poder adjuntar archivos.');
      return;
    }

    if (this.pendingUploads().length === 0) {
      return;
    }

    this.uploading.set(true);
    const failedFiles: string[] = [];

    try {
      for (const draft of this.pendingUploads()) {
        try {
          const uploaded = await firstValueFrom(
            this.attachmentService.uploadAttachment(this.ticketId, draft.file, draft.tag)
          );
          this.attachments.update((current) => this.sortAttachments([...current, uploaded]));
        } catch (error) {
          console.error('Error al subir archivo:', error);
          failedFiles.push(draft.file.name);
        }
      }

      this.attachmentsChange.emit(this.attachments());
      if (failedFiles.length === 0) {
        this.pendingUploads.set([]);
      } else {
        this.pendingUploads.update((drafts) => drafts.filter((draft) => failedFiles.includes(draft.file.name)));
        alert(`No se pudieron subir estos archivos: ${failedFiles.join(', ')}`);
      }
    } finally {
      this.uploading.set(false);
    }
  }

  async previewFile(attachment: Attachment): Promise<void> {
    if (this.attachmentService.isMockMode()) {
      alert('La previsualización no está disponible en modo mock.');
      return;
    }

    try {
      const fileBlob = await firstValueFrom(this.attachmentService.downloadAttachment(attachment.id));
      const objectUrl = URL.createObjectURL(fileBlob);

      if (attachment.fileType === 'image' || attachment.fileFormat === 'pdf') {
        window.open(objectUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        return;
      }

      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = attachment.filename;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      alert(this.extractErrorMessage(error, 'Error al descargar el archivo.'));
    }
  }

  deleteAttachment(attachment: Attachment, event: Event): void {
    event.stopPropagation();
    if (!confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      return;
    }

    this.attachmentService.deleteAttachment(attachment.id).subscribe({
      next: () => {
        this.attachments.update((current) => current.filter((item) => item.id !== attachment.id));
        this.attachmentsChange.emit(this.attachments());
      },
      error: (error) => {
        console.error('Error al eliminar archivo:', error);
        alert(this.extractErrorMessage(error, 'Error al eliminar el archivo.'));
      }
    });
  }

  private loadAttachments(): void {
    if (!this.ticketId) {
      this.attachments.set([]);
      return;
    }

    this.attachmentService.listAttachments(this.ticketId).subscribe({
      next: (attachments) => {
        const ordered = this.sortAttachments(attachments);
        this.attachments.set(ordered);
        this.attachmentsChange.emit(ordered);
      },
      error: (error) => {
        console.error('Error al cargar adjuntos:', error);
        this.attachments.set([]);
      }
    });
  }

  private queueFiles(files: FileList): void {
    const nextDrafts: AttachmentUploadDraft[] = [];
    const unsupportedFiles: string[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      if (file.size > this.maxFileSize) {
        alert(`El archivo ${file.name} excede el tamaño máximo permitido de ${this.maxFileSize / 1024 / 1024} MB.`);
        continue;
      }

      const metadata = detectAttachmentMetadata(file.name);
      if (!metadata || !this.allowedTypes.includes(metadata.fileType)) {
        unsupportedFiles.push(file.name);
        continue;
      }

      nextDrafts.push({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        fileType: metadata.fileType,
        fileFormat: metadata.fileFormat,
        tag: ''
      });
    }

    this.pendingUploads.update((current) => [...current, ...nextDrafts]);

    if (unsupportedFiles.length > 0) {
      alert(`Formato no soportado: ${unsupportedFiles.join(', ')}`);
    }
  }

  private sortAttachments(attachments: Attachment[]): Attachment[] {
    return [...attachments].sort((left, right) =>
      new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime()
    );
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const maybeHttpError = error as { error?: { message?: string } };
      if (maybeHttpError.error?.message) {
        return maybeHttpError.error.message;
      }
    }
    return fallback;
  }
}
