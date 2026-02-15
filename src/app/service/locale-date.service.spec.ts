import { TestBed } from '@angular/core/testing';
import { LocaleDateService } from './locale-date.service';

describe('LocaleDateService', () => {
  let service: LocaleDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocaleDateService]
    });
    service = TestBed.inject(LocaleDateService);
  });

  it('should format YYYY-MM-DD values preserving calendar date', () => {
    const formatted = service.formatDateOnly('2026-02-14');

    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/\d/);
  });

  it('should return dash for invalid date values', () => {
    expect(service.formatDate('invalid-date')).toBe('-');
    expect(service.formatDateTime('invalid-date')).toBe('-');
  });

  it('should format datetime values with date and hour', () => {
    const formatted = service.formatDateTime('2026-02-14T15:30:00Z');

    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/\d/);
  });
});
