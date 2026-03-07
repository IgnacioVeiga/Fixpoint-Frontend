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
import { Attachment, AttachmentType } from '../../models/attachment.model';
import { AttachmentsService } from '../../service/attachments.service';
import { LocaleDateService } from '../../service/locale-date.service';

@Component({
  selector: 'app-attachment-uploader',
  templateUrl: './attachment-uploader.component.html',
  styleUrls: ['./attachment-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class AttachmentUploaderComponent implements OnChanges {
  @Input() ticketId?: number;
  @Input() maxFileSize = 10 * 1024 * 1024;
  @Input() allowedTypes: AttachmentType[] = ['photo', 'contract', 'invoice', 'other'];
  @Output() attachmentsChange = new EventEmitter<Attachment[]>();

  private readonly fileTypes: Record<AttachmentType, { icon: string; accept: string }> = {
    photo: { icon: '📷', accept: 'image/*' },
    contract: { icon: '📄', accept: '.pdf' },
    invoice: { icon: '🧾', accept: '.pdf' },
    other: { icon: '📎', accept: '.pdf,image/*' }
  };

  readonly attachments = signal<Attachment[]>([]);
  readonly uploading = signal(false);
  readonly dragOver = signal(false);

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
    return this.allowedTypes
      .map((type) => this.fileTypes[type]?.accept ?? '')
      .filter((accept) => accept.length > 0)
      .join(',');
  }

  getFileTypeIcon(type: AttachmentType): string {
    return this.fileTypes[type]?.icon ?? this.fileTypes.other.icon;
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
      void this.handleFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      void this.handleFiles(input.files);
      input.value = '';
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

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  formatAttachmentDate(value: string): string {
    return this.localeDate.formatDateTime(value);
  }

  private loadAttachments(): void {
    if (!this.ticketId) {
      this.attachments.set([]);
      return;
    }

    this.attachmentService.listAttachments(this.ticketId).subscribe({
      next: (attachments) => {
        this.attachments.set(attachments);
        this.attachmentsChange.emit(attachments);
      },
      error: (error) => {
        console.error('Error al cargar adjuntos:', error);
        this.attachments.set([]);
      }
    });
  }

  private async handleFiles(files: FileList): Promise<void> {
    if (!this.ticketId) {
      alert('Primero debés guardar el ticket para poder adjuntar archivos.');
      return;
    }

    this.uploading.set(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > this.maxFileSize) {
          alert(`El archivo ${file.name} excede el tamaño máximo permitido de ${this.maxFileSize / 1024 / 1024} MB.`);
          continue;
        }

        const fileType = this.getFileType(file);
        if (!fileType) {
          alert(`Tipo de archivo no permitido: ${file.name}`);
          continue;
        }

        const uploaded = await firstValueFrom(this.attachmentService.uploadAttachment(this.ticketId, file, fileType));
        this.attachments.update((current) => [...current, uploaded]);
        this.attachmentsChange.emit(this.attachments());
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert(this.extractErrorMessage(error, 'Error al subir el archivo.'));
    } finally {
      this.uploading.set(false);
    }
  }

  private getFileType(file: File): AttachmentType | null {
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (isImage && this.allowedTypes.includes('photo')) return 'photo';
    if (isPdf && this.allowedTypes.includes('contract')) return 'contract';
    if (isPdf && this.allowedTypes.includes('invoice')) return 'invoice';
    if ((isPdf || isImage) && this.allowedTypes.includes('other')) return 'other';
    return null;
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
