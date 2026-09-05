import { Pipe, PipeTransform } from '@angular/core';

import { categoryColor } from '../../core/utils/category-color';

@Pipe({ name: 'categoryColor', standalone: false })
export class CategoryColorPipe implements PipeTransform {
  transform(categoryId: string | null | undefined): string {
    return categoryColor(categoryId);
  }
}
