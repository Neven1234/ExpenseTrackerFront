import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { CategoryResponse } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toasts = inject(ToastService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly categories = signal<CategoryResponse[]>([]);

  readonly formOpen = signal(false);
  readonly editing = signal<CategoryResponse | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly pendingDelete = signal<CategoryResponse | null>(null);
  readonly deleting = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
  });

  get isEditing(): boolean {
    return this.editing() !== null;
  }

  get nameInvalid(): boolean {
    const field = this.form.controls.name;

    return field.invalid && (field.dirty || field.touched);
  }

  ngOnInit(): void {
    this.load();
  }

  openAdd(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.form.reset({ name: '' });
    this.formOpen.set(true);
  }

  openEdit(category: CategoryResponse): void {
    this.editing.set(category);
    this.formError.set(null);
    this.form.reset({ name: category.name });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = { name: this.form.getRawValue().name.trim() };
    const editing = this.editing();

    this.saving.set(true);
    this.formError.set(null);

    const save = editing
      ? this.categoryService.update(editing.id, request)
      : this.categoryService.create(request);

    save.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.toasts.success(editing ? 'Category renamed.' : 'Category added.');
        this.closeForm();
        this.load();
      },
      error: (error: Error) => this.formError.set(error.message),
    });
  }

  confirmDelete(category: CategoryResponse): void {
    this.pendingDelete.set(category);
  }

  deleteCategory(): void {
    const category = this.pendingDelete();

    if (!category) {
      return;
    }

    this.deleting.set(true);

    this.categoryService
      .remove(category.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.pendingDelete.set(null);
          this.toasts.success('Category deleted.');
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

    this.categoryService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: categories => this.categories.set(categories),
        error: (error: Error) => this.loadError.set(error.message),
      });
  }
}
