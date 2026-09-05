import { Pipe, PipeTransform } from '@angular/core';

import { dayLabel } from '../../core/utils/format';

@Pipe({ name: 'dayLabel', standalone: false })
export class DayLabelPipe implements PipeTransform {
  transform(value: string): string {
    return dayLabel(value);
  }
}
