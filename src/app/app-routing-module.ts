import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

const routes: Routes = [
  {
    path: 'account',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        title: 'Overview',
        loadChildren: () => import('./features/overview/overview-module').then(m => m.OverviewModule),
      },
      {
        path: 'expenses',
        title: 'Expenses',
        loadChildren: () => import('./features/expenses/expenses-module').then(m => m.ExpensesModule),
      },
      {
        path: 'categories',
        title: 'Categories',
        loadChildren: () => import('./features/categories/categories-module').then(m => m.CategoriesModule),
      },
      {
        path: 'budgets',
        title: 'Budgets',
        loadChildren: () => import('./features/budgets/budgets-module').then(m => m.BudgetsModule),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
