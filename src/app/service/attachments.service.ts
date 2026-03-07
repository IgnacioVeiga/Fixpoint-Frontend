import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Attachment, AttachmentType } from '../models/attachment.model';
import { MOCK_RECENT_FILES } from '../models/mock-data/dashboard.mock';
import { environment } from '../../environments/environment';

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
    return environment.useMockFallback;
  }

  listAttachments(ticketId: number): Observable<Attachment[]> {
    if (environment.useMockFallback) {
      return of(this.mockAttachmentsByTicket.get(ticketId) ?? []);
    }

    return this.api.get<Attachment[]>(`attachments/ticket/${ticketId}`).pipe(
      catchError((error) => this.handleError(error, `Error al listar adjuntos del ticket ${ticketId}`))
    );
  }

  getAttachment(id: number): Observable<Attachment> {
    if (environment.useMockFallback) {
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

  uploadAttachment(ticketId: number, file: File, fileType: AttachmentType): Observable<Attachment> {
    if (environment.useMockFallback) {
      const mockAttachment: Attachment = {
        id: Date.now(),
        ticketId,
        filename: file.name,
        filepath: `/mock/${file.name}`,
        fileType,
        uploadedAt: new Date().toISOString()
      };
      const ticketAttachments = this.mockAttachmentsByTicket.get(ticketId) ?? [];
      this.mockAttachmentsByTicket.set(ticketId, [...ticketAttachments, mockAttachment]);
      return of(mockAttachment);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    return this.api.post<Attachment>(`attachments/upload/ticket/${ticketId}`, formData).pipe(
      catchError((error) => this.handleError(error, `Error al subir adjunto al ticket ${ticketId}`))
    );
  }

  deleteAttachment(id: number): Observable<void> {
    if (environment.useMockFallback) {
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

  downloadAttachment(id: number): Observable<Blob> {
    if (environment.useMockFallback) {
      return throwError(() => new Error('La descarga no está disponible en modo mock.'));
    }

    return this.http
      .get(this.getDownloadUrl(id), {
        responseType: 'blob',
        withCredentials: true
      })
      .pipe(catchError((error) => this.handleError(error, `Error al descargar adjunto ${id}`)));
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
