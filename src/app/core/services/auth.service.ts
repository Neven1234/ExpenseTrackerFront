import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, AuthSession, LoginRequest, RegisterRequest } from '../models';

const STORAGE_KEY = 'expense-tracker.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  private readonly session = signal<AuthSession | null>(this.restore());

  readonly user = this.session.asReadonly();
  readonly isSignedIn = computed(() => this.session() !== null);
  readonly initials = computed(() => {
    const name = this.session()?.username ?? '';
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return '?';
    }

    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : (parts[0]?.charAt(1) ?? '');

    return `${first}${second}`.toUpperCase();
  });

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap(response => this.persist(response)));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap(response => this.persist(response)));
  }

  signOut(): void {
    this.session.set(null);

    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private persist(response: AuthResponse): void {
    const session: AuthSession = {
      userId: response.userId,
      email: response.email,
      username: response.username,
      token: response.token,
      expiresAtUtc: response.expiresAtUtc,
    };

    this.session.set(session);

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }

  private restore(): AuthSession | null {
    if (!this.isBrowser) {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as AuthSession;

      if (!session.token || this.hasExpired(session.expiresAtUtc)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private hasExpired(expiresAtUtc: string): boolean {
    // The API serialises a UTC `DateTime` without an offset marker, so pin it to UTC.
    const stamp = /(Z|[+-]\d{2}:\d{2})$/.test(expiresAtUtc) ? expiresAtUtc : `${expiresAtUtc}Z`;
    const expiry = Date.parse(stamp);

    return Number.isNaN(expiry) ? false : expiry <= Date.now();
  }
}
