import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CategoryResponse, ExpenseRequest, ExpenseResponse } from '../../../core/models';
import { ExpenseService } from '../../../core/services/expense.service';
import { ToastService } from '../../../core/services/toast.service';
import { daysInMonth, toDateOnly } from '../../../core/utils/format';

@Component({
  selector: 'app-expense-form',
  standalone: false,
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.css',
})
export class ExpenseFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly expenseService = inject(ExpenseService);
  private readonly toasts = inject(ToastService);

  /** Existing expense to edit; leave unset to log a new one. */
  @Input() expense: ExpenseResponse | null = null;
  @Input({ required: true }) categories: CategoryResponse[] = [];
  /** Month the app is looking at, which seeds the date on a new expense. */
  @Input({ required: true }) year = new Date().getFullYear();
  @Input({ required: true }) month = new Date().getMonth() + 1;

  @Output() saved = new EventEmitter<ExpenseResponse>();
  @Output() cancelled = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    note: ['', [Validators.required, Validators.maxLength(250)]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    spentOn: ['', Validators.required],
    categoryId: ['', Validators.required],
  });

  get isEditing(): boolean {
    return this.expense !== null;
  }

  ngOnInit(): void {
    if (this.expense) {
      this.form.setValue({
        note: this.expense.note,
        amount: this.expense.amount,
        spentOn: this.expense.spentOn,
        categoryId: this.expense.categoryId,
      });

      return;
    }

    this.form.patchValue({
      spentOn: this.defaultDate(),
      categoryId: this.categories[0]?.id ?? '',
    });
  }

  invalid(control: 'note' | 'amount' | 'spentOn' | 'categoryId'): boolean {
    const field = this.form.controls[control];

    return field.invalid && (field.dirty || field.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: ExpenseRequest = {
      note: value.note.trim(),
      amount: Number(value.amount),
      spentOn: value.spentOn,
      categoryId: value.categoryId,
    };

    this.saving.set(true);
    this.error.set(null);

    const save = this.expense
      ? this.expenseService.update(this.expense.id, request)
      : this.expenseService.create(request);

    save.subscribe({
      next: expense => {
        this.saving.set(false);
        this.toasts.success(this.isEditing ? 'Expense updated.' : 'Expense logged.');
        this.saved.emit(expense);
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.error.set(error.message);
      },
    });
  }

  /** Today when the selected month is the current one, otherwise the 1st. */
  private defaultDate(): string {
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === this.year && now.getMonth() + 1 === this.month;
    const day = isCurrentMonth ? now.getDate() : 1;

    return toDateOnly(new Date(this.year, this.month - 1, Math.min(day, daysInMonth(this.year, this.month))));
  }
}
