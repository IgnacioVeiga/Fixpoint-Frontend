import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericAPIService } from './generic-api.service';

type HttpParamValue = string | number | boolean | null | undefined;
type HttpParamMap = Record<string, HttpParamValue>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = inject(GenericAPIService);

  get<T>(endpoint: string, params?: HttpParamMap): Observable<T> {
    return this.api.GET<T>(endpoint, params);
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.api.POST<T>(endpoint, body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.api.PUT<T>(endpoint, body);
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.api.PATCH<T>(endpoint, body);
  }

  delete<T>(endpoint: string, params?: HttpParamMap): Observable<T> {
    return this.api.DELETE<T>(endpoint, params);
  }

  resolveUrl(endpoint: string): string {
    return this.api.resolveUrl(endpoint);
  }
}
