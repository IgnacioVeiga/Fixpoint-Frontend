import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should resolve relative endpoints using the configured API base url', () => {
    expect(service.resolveUrl('/tickets/10')).toBe(`${apiBaseUrl}/tickets/10`);
  });

  it('should keep absolute urls unchanged', () => {
    const absoluteUrl = 'https://cdn.example.com/file.pdf';
    expect(service.resolveUrl(absoluteUrl)).toBe(absoluteUrl);
  });

  it('should normalize query params and skip null/undefined values', () => {
    service
      .get<unknown[]>('tickets', {
        status: 'repairing',
        page: 2,
        active: true,
        nullable: null,
        missing: undefined
      })
      .subscribe();

    const req = httpMock.expectOne(
      request =>
        request.url === `${apiBaseUrl}/tickets` &&
        request.params.get('status') === 'repairing' &&
        request.params.get('page') === '2' &&
        request.params.get('active') === 'true' &&
        request.withCredentials &&
        !request.params.has('nullable') &&
        !request.params.has('missing')
    );

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
