import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateMonthlyBudgetRequest,
  MonthlyBudgetResponse,
  MonthlyBudgetSummaryResponse,
  UpdateMonthlyBudgetRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/budgets`;

  list(): Observable<MonthlyBudgetResponse[]> {
    return this.http.get<MonthlyBudgetResponse[]>(this.baseUrl);
  }

  /** Resolves to null (API returns 204) when no budget exists for that month yet. */
  getMonth(year: number, month: number): Observable<MonthlyBudgetSummaryResponse | null> {
    return this.http
      .get<MonthlyBudgetSummaryResponse | null>(`${this.baseUrl}/${year}/${month}`)
      .pipe(map(summary => summary ?? null));
  }

  create(request: CreateMonthlyBudgetRequest): Observable<MonthlyBudgetResponse> {
    return this.http.post<MonthlyBudgetResponse>(this.baseUrl, request);
  }

  update(year: number, month: number, request: UpdateMonthlyBudgetRequest): Observable<MonthlyBudgetResponse> {
    return this.http.put<MonthlyBudgetResponse>(`${this.baseUrl}/${year}/${month}`, request);
  }

  remove(year: number, month: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${year}/${month}`);
  }
}
