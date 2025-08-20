import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Attachment } from '../models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentsService {
  private api = inject(ApiService);
  private endpoint = 'attachments';

  listAttachments(ticketId: number): Observable<Attachment[]> {
    return this.api.get<Attachment[]>(`${this.endpoint}?ticketId=${ticketId}`);
  }

  getAttachment(id: number): Observable<Attachment> {
    return this.api.get<Attachment>(`${this.endpoint}/${id}`);
  }

  uploadAttachment(formData: FormData): Observable<Attachment> {
    return this.api.post<Attachment>(this.endpoint, formData);
  }

  deleteAttachment(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
