export interface ExpenseResponse {
  id: string;
  amount: number;
  note: string;
  /** ISO date, `yyyy-MM-dd` — matches the API's `DateOnly`. */
  spentOn: string;
  categoryId: string;
  categoryName: string;
}

export interface ExpenseRequest {
  categoryId: string;
  amount: number;
  note: string;
  spentOn: string;
}

export interface ExpenseFilter {
  year?: number;
  month?: number;
  categoryId?: string;
}
