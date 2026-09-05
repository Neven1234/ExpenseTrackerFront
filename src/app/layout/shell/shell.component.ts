import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-shell',
  standalone: false,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly links: NavLink[] = [
    { label: 'Overview', path: '/overview' },
    { label: 'Expenses', path: '/expenses' },
    { label: 'Categories', path: '/categories' },
    { label: 'Budgets', path: '/budgets' },
  ];

  readonly user = this.auth.user;
  readonly initials = this.auth.initials;
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/account/sign-in']);
  }
}
