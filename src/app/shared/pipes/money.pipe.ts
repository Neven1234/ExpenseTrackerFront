import { Pipe, PipeTransform } from '@angular/core';

const FORMATTER = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

@Pipe({ name: 'money', standalone: false })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, style: 'plain' | 'code' = 'plain'): string {
    const amount = FORMATTER.format(value ?? 0);

    return style === 'code' ? `EGP ${amount}` : amount;
  }
}
