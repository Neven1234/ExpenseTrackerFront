import { Injectable, computed, signal } from '@angular/core';

import { monthLabel } from '../utils/format';

/**
 * The month the whole app is looking at. Shared so the overview, the ledger and
 * the add-expense form all agree on which budget is in play.
 */
@Injectable({ providedIn: 'root' })
export class MonthStateService {
  private readonly today = new Date();

  readonly year = signal(this.today.getFullYear());
  readonly month = signal(this.today.getMonth() + 1);

  readonly label = computed(() => monthLabel(this.year(), this.month()));

  readonly isCurrentMonth = computed(() => {
    const now = new Date();
    return this.year() === now.getFullYear() && this.month() === now.getMonth() + 1;
  });

  previous(): void {
    this.shift(-1);
  }

  next(): void {
    this.shift(1);
  }

  set(year: number, month: number): void {
    this.year.set(year);
    this.month.set(month);
  }

  private shift(step: number): void {
    const cursor = new Date(this.year(), this.month() - 1 + step, 1);

    this.year.set(cursor.getFullYear());
    this.month.set(cursor.getMonth() + 1);
  }
}
