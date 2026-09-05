import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { IconName } from '../../shared/components/icon/icon.component';

interface NavLink {
  label: string;
  path: string;
  icon: IconName;
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
    { label: 'Overview', path: '/overview', icon: 'pie-chart' },
    { label: 'Expenses', path: '/expenses', icon: 'receipt' },
    { label: 'Categories', path: '/categories', icon: 'tag' },
    { label: 'Budgets', path: '/budgets', icon: 'wallet' },
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
