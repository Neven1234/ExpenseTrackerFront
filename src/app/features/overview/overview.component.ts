import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import {
  CategoryResponse,
  ExpenseResponse,
  MonthlyBudgetResponse,
  MonthlyBudgetSummaryResponse,
} from '../../core/models';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseService } from '../../core/services/expense.service';
import { MonthStateService } from '../../core/services/month-state.service';
import { ToastService } from '../../core/services/toast.service';
import { categoryColor } from '../../core/utils/category-color';
import { daysElapsed, shortMonthLabel } from '../../core/utils/format';
import { ExpenseDay, groupByDay } from '../../core/utils/group';

interface Slice {
  categoryId: string;
  name: string;
  amount: number;
  share: number;
  color: string;
}

const RECENT_LIMIT = 6;

@Component({
  selector: 'app-overview',
  standalone: false,
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class OverviewComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toasts = inject(ToastService);

  readonly monthState = inject(MonthStateService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly summary = signal<MonthlyBudgetSummaryResponse | null>(null);
  readonly expenses = signal<ExpenseResponse[]>([]);
  readonly categories = signal<CategoryResponse[]>([]);
  readonly allBudgets = signal<MonthlyBudgetResponse[]>([]);

  readonly formOpen = signal(false);
  readonly editing = signal<ExpenseResponse | null>(null);
  readonly pendingDelete = signal<ExpenseResponse | null>(null);
  readonly deleting = signal(false);
  readonly savingBudget = signal(false);

  readonly budgetForm = this.formBuilder.nonNullable.group({
    allowance: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  readonly budget = computed(() => this.summary()?.budget ?? null);

  readonly hasBudget = computed(() => this.budget() !== null);

  readonly dailyAverage = computed(() => {
    const spent = this.budget()?.spent ?? 0;
    const days = daysElapsed(this.monthState.year(), this.monthState.month());

    return days > 0 ? spent / days : 0;
  });

  /** Previous month's spend, used for the month-on-month cell. */
  readonly previousBudget = computed(() => {
    const cursor = new Date(this.monthState.year(), this.monthState.month() - 2, 1);
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;

    return this.allBudgets().find(item => item.year === year && item.month === month) ?? null;
  });

  readonly previousLabel = computed(() => {
    const cursor = new Date(this.monthState.year(), this.monthState.month() - 2, 1);

    return shortMonthLabel(cursor.getFullYear(), cursor.getMonth() + 1);
  });

  /** Percentage change against last month, or null when there is nothing to compare to. */
  readonly changeAgainstPrevious = computed<{ percent: number } | null>(() => {
    const previous = this.previousBudget()?.spent ?? 0;
    const current = this.budget()?.spent ?? 0;

    if (previous <= 0) {
      return null;
    }

    return { percent: ((current - previous) / previous) * 100 };
  });

  /** How much of the available budget is spent, clamped for the meter. */
  readonly spentShare = computed(() => {
    const budget = this.budget();

    if (!budget || budget.totalAvailable <= 0) {
      return budget && budget.spent > 0 ? 100 : 0;
    }

    return Math.min((budget.spent / budget.totalAvailable) * 100, 100);
  });

  readonly slices = computed<Slice[]>(() => {
    const spending = this.summary()?.spendingByCategory ?? [];
    const total = spending.reduce((sum, item) => sum + item.amount, 0);

    if (total <= 0) {
      return [];
    }

    return spending.map(item => ({
      categoryId: item.categoryId,
      name: item.categoryName,
      amount: item.amount,
      share: (item.amount / total) * 100,
      color: categoryColor(item.categoryId),
    }));
  });

  readonly recentDays = computed<ExpenseDay[]>(() => groupByDay(this.expenses().slice(0, RECENT_LIMIT)));

  constructor() {
    // Reload whenever the month changes, including the initial render.
    effect(() => {
      const year = this.monthState.year();
      const month = this.monthState.month();

      this.load(year, month);
    });
  }

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: categories => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
  }

  reload(): void {
    this.load(this.monthState.year(), this.monthState.month());
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

  createBudget(): void {
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.savingBudget.set(true);

    this.budgetService
      .create({
        year: this.monthState.year(),
        month: this.monthState.month(),
        allowance: Number(this.budgetForm.getRawValue().allowance),
      })
      .pipe(finalize(() => this.savingBudget.set(false)))
      .subscribe({
        next: () => {
          this.budgetForm.reset();
          this.toasts.success(`Budget set for ${this.monthState.label()}.`);
          this.reload();
        },
        error: (error: Error) => this.toasts.error(error.message),
      });
  }

  private load(year: number, month: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      summary: this.budgetService.getMonth(year, month),
      expenses: this.expenseService.list({ year, month }),
      budgets: this.budgetService.list(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: result => {
          this.summary.set(result.summary);
          this.expenses.set(result.expenses);
          this.allBudgets.set(result.budgets);
        },
        error: (error: Error) => this.loadError.set(error.message),
      });
  }
}
