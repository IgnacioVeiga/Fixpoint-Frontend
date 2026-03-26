import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Attachment, detectAttachmentMetadata } from '../models/attachment.model';
import { MOCK_RECENT_FILES } from '../models/mock-data/dashboard.mock';
import { environment } from '../../environments/environment';
import { createMockAttachmentThumbnailDataUrl } from '../shared/mock-attachment-thumbnail';

@Injectable({ providedIn: 'root' })
export class AttachmentsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private readonly mockAttachmentsByTicket = new Map<number, Attachment[]>();

  constructor() {
    MOCK_RECENT_FILES.forEach((attachment) => {
      const ticketAttachments = this.mockAttachmentsByTicket.get(attachment.ticketId) ?? [];
      this.mockAttachmentsByTicket.set(attachment.ticketId, [...ticketAttachments, { ...attachment }]);
    });
  }

  isMockMode(): boolean {
    return environment.useMockApi;
  }

  listAttachments(ticketId: number): Observable<Attachment[]> {
    if (environment.useMockApi) {
      return of([...(this.mockAttachmentsByTicket.get(ticketId) ?? [])]);
    }

    return this.api.get<Attachment[]>(`attachments/ticket/${ticketId}`).pipe(
      catchError((error) => this.handleError(error, `Error al listar adjuntos del ticket ${ticketId}`))
    );
  }

  listRecentAttachments(limit = 12): Observable<Attachment[]> {
    if (environment.useMockApi) {
      return of(
        this.collectMockAttachments()
          .sort((left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime())
          .slice(0, limit)
      );
    }

    return this.api.get<Attachment[]>(`attachments/recent`, { limit }).pipe(
      catchError((error) => this.handleError(error, 'Error al listar adjuntos recientes'))
    );
  }

  getAttachment(id: number): Observable<Attachment> {
    if (environment.useMockApi) {
      const attachment = this.findMockAttachmentById(id);
      if (!attachment) {
        return throwError(() => new Error('Adjunto no encontrado'));
      }
      return of(attachment);
    }

    return this.api.get<Attachment>(`attachments/${id}`).pipe(
      catchError((error) => this.handleError(error, `Error al obtener adjunto ${id}`))
    );
  }

  uploadAttachment(ticketId: number, file: File, tag?: string): Observable<Attachment> {
    const metadata = detectAttachmentMetadata(file.name);
    if (!metadata) {
      return throwError(() => new Error(`Formato de archivo no soportado: ${file.name}`));
    }

    const normalizedTag = tag?.trim() || undefined;

    if (environment.useMockApi) {
      const mockAttachment: Attachment = {
        id: Date.now(),
        ticketId,
        filename: file.name,
        filepath: `/mock/${file.name}`,
        fileType: metadata.fileType,
        fileFormat: metadata.fileFormat,
        fileSizeBytes: file.size,
        tag: normalizedTag,
        thumbnailUrl: createMockAttachmentThumbnailDataUrl(file.name, metadata.fileType, metadata.fileFormat, normalizedTag),
        uploadedAt: new Date().toISOString()
      };
      const ticketAttachments = this.mockAttachmentsByTicket.get(ticketId) ?? [];
      this.mockAttachmentsByTicket.set(ticketId, [...ticketAttachments, mockAttachment]);
      return of(mockAttachment);
    }

    const formData = new FormData();
    formData.append('file', file);
    if (normalizedTag) {
      formData.append('tag', normalizedTag);
    }

    return this.api.post<Attachment>(`attachments/upload/ticket/${ticketId}`, formData).pipe(
      catchError((error) => this.handleError(error, `Error al subir adjunto al ticket ${ticketId}`))
    );
  }

  deleteAttachment(id: number): Observable<void> {
    if (environment.useMockApi) {
      this.mockAttachmentsByTicket.forEach((attachments, ticketId) => {
        const filtered = attachments.filter((attachment) => attachment.id !== id);
        this.mockAttachmentsByTicket.set(ticketId, filtered);
      });
      return of(undefined);
    }

    return this.api.delete<void>(`attachments/${id}`).pipe(
      catchError((error) => this.handleError(error, `Error al eliminar adjunto ${id}`))
    );
  }

  getDownloadUrl(id: number): string {
    return this.api.resolveUrl(`attachments/download/${id}`);
  }

  getThumbnailUrl(attachment: Attachment): string | null {
    if (environment.useMockApi) {
      return attachment.thumbnailUrl ?? null;
    }

    const versionToken = encodeURIComponent(attachment.filepath ?? `${attachment.id}`);
    return this.api.resolveUrl(`attachments/thumbnail/${attachment.id}?v=${versionToken}`);
  }

  downloadAttachment(id: number): Observable<Blob> {
    if (environment.useMockApi) {
      return throwError(() => new Error('La descarga no está disponible en modo mock.'));
    }

    return this.http
      .get(this.getDownloadUrl(id), {
        responseType: 'blob',
        withCredentials: true
      })
      .pipe(catchError((error) => this.handleError(error, `Error al descargar adjunto ${id}`)));
  }

  private collectMockAttachments(): Attachment[] {
    return Array.from(this.mockAttachmentsByTicket.values()).flatMap((attachments) =>
      attachments.map((attachment) => ({ ...attachment }))
    );
  }

  private findMockAttachmentById(id: number): Attachment | undefined {
    for (const attachments of this.mockAttachmentsByTicket.values()) {
      const match = attachments.find((attachment) => attachment.id === id);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  private handleError(error: unknown, message: string): Observable<never> {
    console.error(message, error);
    return throwError(() => error);
  }
}
