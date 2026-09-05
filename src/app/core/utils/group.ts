import { ExpenseResponse } from '../models';

export interface ExpenseDay {
  date: string;
  expenses: ExpenseResponse[];
  total: number;
}

/** Groups expenses into the day blocks the ledger renders, newest day first. */
export function groupByDay(expenses: ExpenseResponse[]): ExpenseDay[] {
  const days = new Map<string, ExpenseResponse[]>();

  for (const expense of expenses) {
    const bucket = days.get(expense.spentOn);

    if (bucket) {
      bucket.push(expense);
    } else {
      days.set(expense.spentOn, [expense]);
    }
  }

  return [...days.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, items]) => ({
      date,
      expenses: items,
      total: items.reduce((sum, expense) => sum + expense.amount, 0),
    }));
}
