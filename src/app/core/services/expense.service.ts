import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ExpenseFilter, ExpenseRequest, ExpenseResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/expenses`;

  list(filter: ExpenseFilter = {}): Observable<ExpenseResponse[]> {
    let params = new HttpParams();

    if (filter.year != null) {
      params = params.set('year', filter.year);
    }

    if (filter.month != null) {
      params = params.set('month', filter.month);
    }

    if (filter.categoryId) {
      params = params.set('categoryId', filter.categoryId);
    }

    return this.http.get<ExpenseResponse[]>(this.baseUrl, { params });
  }

  get(id: string): Observable<ExpenseResponse> {
    return this.http.get<ExpenseResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: ExpenseRequest): Observable<ExpenseResponse> {
    return this.http.post<ExpenseResponse>(this.baseUrl, request);
  }

  update(id: string, request: ExpenseRequest): Observable<ExpenseResponse> {
    return this.http.put<ExpenseResponse>(`${this.baseUrl}/${id}`, request);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
