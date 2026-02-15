import { Injectable } from '@angular/core';

type DateInput = string | number | Date;

@Injectable({ providedIn: 'root' })
export class LocaleDateService {
  private static readonly DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  private static readonly DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };

  formatDate(value: DateInput): string {
    const date = this.toDate(value);
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat(undefined, LocaleDateService.DATE_OPTIONS).format(date);
  }

  formatDateTime(value: DateInput): string {
    const date = this.toDate(value);
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat(undefined, LocaleDateService.DATETIME_OPTIONS).format(date);
  }

  formatDateOnly(value: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return this.formatDate(new Date(year, month - 1, day));
    }

    return this.formatDate(value);
  }

  private toDate(value: DateInput): Date | null {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
