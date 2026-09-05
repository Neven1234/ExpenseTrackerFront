import { Component, computed, effect, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { CategoryResponse, ExpenseResponse } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseService } from '../../core/services/expense.service';
import { MonthStateService } from '../../core/services/month-state.service';
import { ToastService } from '../../core/services/toast.service';
import { ExpenseDay, groupByDay } from '../../core/utils/group';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly toasts = inject(ToastService);

  readonly monthState = inject(MonthStateService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly expenses = signal<ExpenseResponse[]>([]);
  readonly categories = signal<CategoryResponse[]>([]);
  readonly categoryFilter = signal('');
  readonly page = signal(1);

  readonly formOpen = signal(false);
  readonly editing = signal<ExpenseResponse | null>(null);
  readonly pendingDelete = signal<ExpenseResponse | null>(null);
  readonly deleting = signal(false);

  readonly total = computed(() => this.expenses().length);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  readonly pageStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1));
  readonly pageEnd = computed(() => Math.min(this.page() * PAGE_SIZE, this.total()));

  readonly days = computed<ExpenseDay[]>(() =>
    groupByDay(this.expenses().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE)),
  );

  readonly monthTotal = computed(() => this.expenses().reduce((sum, expense) => sum + expense.amount, 0));

  constructor() {
    effect(() => {
      const year = this.monthState.year();
      const month = this.monthState.month();
      const categoryId = this.categoryFilter();

      this.load(year, month, categoryId);
    });
  }

  onFilterChange(categoryId: string): void {
    this.categoryFilter.set(categoryId);
  }

  previousPage(): void {
    this.page.update(page => Math.max(1, page - 1));
  }

  nextPage(): void {
    this.page.update(page => Math.min(this.pageCount(), page + 1));
  }

  openAdd(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  openEdit(expense: ExpenseResponse): void {
    this.editing.set(expense);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.reload();
  }

  confirmDelete(expense: ExpenseResponse): void {
    this.pendingDelete.set(expense);
  }

  deleteExpense(): void {
    const expense = this.pendingDelete();

    if (!expense) {
      return;
    }

    this.deleting.set(true);

    this.expenseService
      .remove(expense.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.pendingDelete.set(null);
          this.toasts.success('Expense deleted.');
          this.reload();
        },
        error: (error: Error) => {
          this.pendingDelete.set(null);
          this.toasts.error(error.message);
        },
      });
  }

  reload(): void {
    this.load(this.monthState.year(), this.monthState.month(), this.categoryFilter());
  }

  private load(year: number, month: number, categoryId: string): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      expenses: this.expenseService.list({ year, month, categoryId: categoryId || undefined }),
      categories: this.categoryService.list().pipe(catchError(() => of([] as CategoryResponse[]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: result => {
          this.expenses.set(result.expenses);
          this.categories.set(result.categories);
          this.page.set(1);
        },
        error: (error: Error) => {
          this.expenses.set([]);
          this.loadError.set(error.message);
        },
      });
  }
}
