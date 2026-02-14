import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

type HttpParamValue = string | number | boolean | null | undefined;
type HttpParamMap = Record<string, HttpParamValue>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  get<T>(endpoint: string, params?: HttpParamMap): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), { params: this.toHttpParams(params) });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body);
  }

  delete<T>(endpoint: string, params?: HttpParamMap): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), { params: this.toHttpParams(params) });
  }

  resolveUrl(endpoint: string): string {
    return this.buildUrl(endpoint);
  }

  private buildUrl(endpoint: string): string {
    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    const sanitized = endpoint.replace(/^\/+/, '');
    return `${this.baseUrl}/${sanitized}`;
  }

  private toHttpParams(params?: HttpParamMap): HttpParams {
    if (!params) {
      return new HttpParams();
    }

    const normalized: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        normalized[key] = String(value);
      }
    });

    return new HttpParams({ fromObject: normalized });
  }
}
