import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ModalComponent } from './components/modal/modal.component';
import { ToastHostComponent } from './components/toast-host/toast-host.component';
import { CategoryColorPipe } from './pipes/category-color.pipe';
import { DayLabelPipe } from './pipes/day-label.pipe';
import { MoneyPipe } from './pipes/money.pipe';

const SHARED = [
  ConfirmDialogComponent,
  EmptyStateComponent,
  ExpenseFormComponent,
  ModalComponent,
  ToastHostComponent,
  CategoryColorPipe,
  DayLabelPipe,
  MoneyPipe,
];

@NgModule({
  declarations: SHARED,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ...SHARED],
})
export class SharedModule {}
