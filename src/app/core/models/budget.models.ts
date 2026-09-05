export interface MonthlyBudgetResponse {
  id: string;
  year: number;
  month: number;
  allowance: number;
  carriedOver: number;
  totalAvailable: number;
  spent: number;
  remaining: number;
}

export interface CategorySpendResponse {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export interface MonthlyBudgetSummaryResponse {
  budget: MonthlyBudgetResponse;
  spendingByCategory: CategorySpendResponse[];
}

export interface CreateMonthlyBudgetRequest {
  year: number;
  month: number;
  allowance: number;
}

export interface UpdateMonthlyBudgetRequest {
  allowance: number;
}
