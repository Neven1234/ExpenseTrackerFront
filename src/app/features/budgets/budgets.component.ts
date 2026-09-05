import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { MonthlyBudgetResponse } from '../../core/models';
import { BudgetService } from '../../core/services/budget.service';
import { MonthStateService } from '../../core/services/month-state.service';
import { ToastService } from '../../core/services/toast.service';
import { monthLabel } from '../../core/utils/format';

@Component({
  selector: 'app-budgets',
  standalone: false,
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.css',
})
export class BudgetsComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly monthState = inject(MonthStateService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly budgets = signal<MonthlyBudgetResponse[]>([]);

  readonly formOpen = signal(false);
  readonly editing = signal<MonthlyBudgetResponse | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly pendingDelete = signal<MonthlyBudgetResponse | null>(null);
  readonly deleting = signal(false);

  readonly years = this.buildYears();
  readonly months = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: monthLabel(2000, index + 1).split(' ')[0] ?? '',
  }));

  readonly form = this.formBuilder.nonNullable.group({
    year: [new Date().getFullYear(), [Validators.required]],
    month: [new Date().getMonth() + 1, [Validators.required]],
    allowance: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  get isEditing(): boolean {
    return this.editing() !== null;
  }

  get allowanceInvalid(): boolean {
    const field = this.form.controls.allowance;

    return field.invalid && (field.dirty || field.touched);
  }

  ngOnInit(): void {
    this.load();
  }

  label(budget: MonthlyBudgetResponse): string {
    return monthLabel(budget.year, budget.month);
  }

  openAdd(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.form.reset({
      year: this.monthState.year(),
      month: this.monthState.month(),
      allowance: null,
    });
    this.form.controls.year.enable();
    this.form.controls.month.enable();
    this.formOpen.set(true);
  }

  openEdit(budget: MonthlyBudgetResponse): void {
    this.editing.set(budget);
    this.formError.set(null);
    this.form.reset({ year: budget.year, month: budget.month, allowance: budget.allowance });
    // The API keys a budget by year and month, so only the allowance is editable.
    this.form.controls.year.disable();
    this.form.controls.month.disable();
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  openMonth(budget: MonthlyBudgetResponse): void {
    this.monthState.set(budget.year, budget.month);
    void this.router.navigate(['/overview']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const allowance = Number(value.allowance);
    const editing = this.editing();

    this.saving.set(true);
    this.formError.set(null);

    const save = editing
      ? this.budgetService.update(editing.year, editing.month, { allowance })
      : this.budgetService.create({ year: Number(value.year), month: Number(value.month), allowance });

    save.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.toasts.success(editing ? 'Allowance updated.' : 'Budget created.');
        this.closeForm();
        this.load();
      },
      error: (error: Error) => this.formError.set(error.message),
    });
  }

  confirmDelete(budget: MonthlyBudgetResponse): void {
    this.pendingDelete.set(budget);
  }

  deleteBudget(): void {
    const budget = this.pendingDelete();

    if (!budget) {
      return;
    }

    this.deleting.set(true);

    this.budgetService
      .remove(budget.year, budget.month)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.pendingDelete.set(null);
          this.toasts.success('Budget deleted.');
          this.load();
        },
        error: (error: Error) => {
          this.pendingDelete.set(null);
          this.toasts.error(error.message);
        },
      });
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.budgetService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: budgets => this.budgets.set([...budgets].reverse()),
        error: (error: Error) => this.loadError.set(error.message),
      });
  }

  private buildYears(): number[] {
    const current = new Date().getFullYear();

    return Array.from({ length: 7 }, (_, index) => current - 3 + index);
  }
}
